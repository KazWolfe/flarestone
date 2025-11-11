# Page Availability Detection

## Overview

The Flarestone XPath engine now includes a comprehensive availability detection system that handles special cases where Lodestone pages exist but have limited or no data available. This system works at the controller level and provides consistent handling across all endpoint types.

## Problem Statement

Lodestone pages can be in various states beyond just "exists" or "doesn't exist":
- **Private profiles**: Character exists but profile is set to private (limited data available)
- **403 Forbidden**: Character exists but no information is accessible
- **404 Not Found**: Character doesn't exist
- **Other errors**: Network issues, server errors, etc.

Previously, these cases were not explicitly handled, leading to parsing errors or unclear responses.

## Solution Architecture

The solution provides three layers:

### 1. Page Result Types (`page_result.ts`)

```typescript
enum PageAvailability {
    AVAILABLE = 'available',    // Full data available
    PRIVATE = 'private',         // Profile is private (partial data)
    FORBIDDEN = 'forbidden',     // 403 response
    NOT_FOUND = 'not_found',     // 404 response
    ERROR = 'error'              // Other errors
}

interface PageResult<T> {
    availability: PageAvailability;
    data?: T;                    // Parsed data (may be partial)
    statusCode?: number;
    error?: string;
}
```

### 2. Availability Detectors (`availability_detectors.ts`)

Detectors are composable functions that check for specific conditions:

```typescript
type AvailabilityDetector = (html: string, statusCode: number) => PageAvailability | null;
```

Built-in detectors:
- `detectHttpErrors`: Checks HTTP status codes (403, 404, etc.)
- `detectPrivateProfile`: Checks for "This character's profile is private" message
- `characterPageDetectors`: Pre-configured chain for character pages

### 3. Engine Integration (`engine/index.ts`)

New function that returns availability information:

```typescript
loadObjectFromUrlWithAvailability<T>(
    url: string,
    targetClass: new () => T,
    detectors: AvailabilityDetector[]
): Promise<PageResult<T>>
```

## Usage

### In Controllers

Controllers use `loadObjectFromUrlWithAvailability` instead of `loadObjectFromUrl`:

```typescript
async getCharacter(request: IRequest): Promise<Response> {
    const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}`;
    const result = await loadObjectFromUrlWithAvailability(
        url, 
        CharacterPage, 
        characterPageDetectors
    );

    const statusCode = this.getStatusCodeForAvailability(result.availability);
    
    return new Response(JSON.stringify(result), {
        status: statusCode,
        headers: {'Content-Type': 'application/json'}
    });
}
```

### Response Format

Clients receive a consistent response structure:

**Public Profile (200 OK):**
```json
{
    "availability": "available",
    "data": {
        "name": "Oowazu Nonowazu",
        "world": "Coeurl",
        "portraitUrl": "https://...",
        "levels": [...],
        ...
    },
    "statusCode": 200
}
```

**Private Profile (200 OK):**
```json
{
    "availability": "private",
    "data": {
        "name": "Alaynabella Blossom",
        "world": "Zalera",
        "headshotUrl": "https://..."
        // Note: portraitUrl, levels, bio, etc. are undefined
    },
    "statusCode": 200
}
```

**Character Not Found (404):**
```json
{
    "availability": "not_found",
    "statusCode": 404
}
```

**Forbidden (403):**
```json
{
    "availability": "forbidden",
    "statusCode": 403
}
```

## Custom Detectors

You can create custom detectors for specific use cases:

```typescript
const detectMaintenanceMode: AvailabilityDetector = (html, statusCode) => {
    if (html.includes('Maintenance in progress')) {
        return PageAvailability.ERROR;
    }
    return null;
};

const myDetectors = [
    detectHttpErrors,
    detectMaintenanceMode,
    detectPrivateProfile
];

const result = await loadObjectFromUrlWithAvailability(
    url, 
    MyPage, 
    myDetectors
);
```

## Benefits

1. **Consistent handling**: Same mechanism works for all page types (character, FC, levels, etc.)
2. **Partial data extraction**: Private profiles still return name, world, headshot, etc.
3. **Clear client communication**: Availability field explicitly tells clients what to expect
4. **Extensible**: Easy to add new detection cases via custom detectors
5. **No breaking changes**: Old `loadObjectFromUrl` still works for internal use

## Testing

Run the availability detection test:

```bash
node --loader ts-node/esm test/scripts/test_availability.ts
```

This tests:
- ✓ Public profiles (full data)
- ✓ Private profiles (partial data)
- ✓ HTTP error codes (403, 404)
- ✓ Multiple page types (character, levels)

## Migration Guide

### For Existing Controllers

Replace:
```typescript
const page = await loadObjectFromUrl(url, CharacterPage);
return new Response(JSON.stringify(page), { status: 200 });
```

With:
```typescript
const result = await loadObjectFromUrlWithAvailability(url, CharacterPage, characterPageDetectors);
const statusCode = this.getStatusCodeForAvailability(result.availability);
return new Response(JSON.stringify(result), { status: statusCode });
```

### For API Clients

Check the `availability` field before using data:

```typescript
const response = await fetch('/api/character/12345');
const result = await response.json();

if (result.availability === 'available') {
    // Full data available
    console.log(result.data.levels);
} else if (result.availability === 'private') {
    // Limited data available
    console.log(`${result.data.name} has a private profile`);
} else {
    // Handle other cases
    console.log(`Character not accessible: ${result.availability}`);
}
```

