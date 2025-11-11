# Query Parameter Support for Pagination

## Overview

You can now pass query parameters directly to control pagination behavior via the API.

## Supported Parameters

- **`maxPages`** - Maximum number of pages to fetch
- **`maxItems`** - Maximum number of items to return  
- **`delayMs`** - Delay between page fetches in milliseconds

## Usage Examples

### Basic Usage

```typescript
// GET /freecompany/123/member?maxPages=5
// Fetches only first 5 pages

// GET /freecompany/123/member?maxItems=100
// Fetches pages until we have at least 100 items, then stops

// GET /freecompany/123/member?maxPages=3&maxItems=50
// Stops at whichever limit is reached first
```

### API Endpoints

```
GET /api/freecompany/:id/members
GET /api/freecompany/:id/members?maxPages=5
GET /api/freecompany/:id/members?maxItems=100
GET /api/freecompany/:id/members?maxPages=10&delayMs=200
GET /api/freecompany/:id/members?maxItems=250&delayMs=50
```

### In Your Controller

```typescript
import { parseAggregationOptions, aggregatePages } from '../magic';

async getAllMembers(request: IRequest): Promise<Response> {
    const url = `https://example.com/data/${request.params.id}`;
    
    // Parse query params and apply defaults
    const options = parseAggregationOptions(request.url, {
        baseUrl: 'https://example.com',
        delayMs: 100  // Default delay
    });
    
    const result = await aggregatePages(
        url,
        DataPage,
        (page) => page.items,
        options  // Query params override defaults
    );
    
    return new Response(JSON.stringify(result));
}
```

## How It Works

The `parseAggregationOptions()` helper:

1. **Parses URL query parameters**: Extracts `maxPages`, `maxItems`, `delayMs` from the URL
2. **Converts to numbers**: Safely parses string values to integers
3. **Merges with defaults**: Query params override defaults you provide
4. **Returns AggregationOptions**: Ready to pass directly to `aggregatePages()`

### Example Flow

```
Request URL:
  /api/members?maxPages=3&maxItems=75&delayMs=150

parseAggregationOptions(request.url, { baseUrl: '...', delayMs: 100 })
  ↓
{
  baseUrl: '...',        // From defaults
  maxPages: 3,           // From query param
  maxItems: 75,          // From query param  
  delayMs: 150           // From query param (overrides default)
}
  ↓
aggregatePages(url, PageClass, extractor, options)
  ↓
Fetches up to 3 pages OR 75 items (whichever comes first)
with 150ms delay between requests
```

## Advanced: Custom Parameters

If you need to support additional custom parameters beyond the standard aggregation options:

```typescript
import { parseQueryOptions } from '../magic';

// Define your extended options
interface MyCustomOptions extends AggregationOptions {
    customTimeout?: number;
    enableCaching?: boolean;
}

// Parse custom parameters
const options = parseQueryOptions<MyCustomOptions>(
    request.url,
    ['maxPages', 'maxItems', 'delayMs', 'customTimeout'],  // Parameter names to parse
    {
        baseUrl: 'https://example.com',
        delayMs: 100,
        customTimeout: 5000
    }
);

// Use custom options
if (options.customTimeout) {
    // Apply custom timeout logic
}
```

## Benefits

✅ **Flexible**: Easily add more parameters by extending the parser  
✅ **Type-safe**: Full TypeScript support  
✅ **DRY**: Reusable across all controllers  
✅ **Safe**: Invalid values are ignored (NaN handling)  
✅ **Secure**: baseUrl comes from server config, not user input  
✅ **Clean**: One line of code in your controller  

## Example API Responses

### Request with maxPages
```
GET /api/freecompany/123/members?maxPages=2
```

Response:
```json
{
  "members": [...],
  "metadata": {
    "totalPages": 10,
    "pagesFetched": 2,
    "complete": false
  }
}
```

### Request with maxItems
```
GET /api/freecompany/123/members?maxItems=50
```

Response:
```json
{
  "members": [... 50 items ...],
  "metadata": {
    "totalPages": 10,
    "pagesFetched": 1,
    "complete": false
  }
}
```

### Request with both limits
```
GET /api/freecompany/123/members?maxPages=5&maxItems=100
```

Stops at whichever limit is reached first.

