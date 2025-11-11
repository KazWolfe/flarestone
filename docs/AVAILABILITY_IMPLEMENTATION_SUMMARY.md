# Availability Detection Implementation Summary

## What Was Implemented

A comprehensive, controller-level system for detecting and handling special states of Lodestone pages (private profiles, 403s, 404s, etc.) that works consistently across all endpoint types.

## Files Created

1. **`src/models/_common/page_result.ts`**
   - `PageAvailability` enum (AVAILABLE, PRIVATE, FORBIDDEN, NOT_FOUND, ERROR)
   - `PageResult<T>` interface (wraps data with availability metadata)
   - `AvailabilityDetector` type definition

2. **`src/models/_common/availability_detectors.ts`**
   - `detectHttpErrors()` - Detects 403, 404, and other HTTP errors
   - `detectPrivateProfile()` - Detects "profile is private" message
   - `characterPageDetectors` - Pre-configured detector chain
   - `detectAvailability()` - Runs detector chain

3. **`test/scripts/test_availability.ts`**
   - Comprehensive test demonstrating all availability states
   - Tests public profiles, private profiles, 403s, 404s
   - Shows that same mechanism works for character and levels pages

4. **`docs/AVAILABILITY_DETECTION.md`**
   - Complete documentation of the feature
   - Usage examples, API format, migration guide

## Files Modified

1. **`src/engine/index.ts`**
   - Added `loadObjectFromUrlWithAvailability()` function
   - Added `deserialize()` alias
   - Exported new types and detectors

2. **`src/controllers/character_controller.ts`**
   - Updated `getCharacter()` to use availability detection
   - Updated `getCharacterLevels()` to use availability detection
   - Added `getStatusCodeForAvailability()` helper

3. **`src/controllers/free_company_controller.ts`**
   - Updated `getFreeCompany()` to use availability detection
   - Added `getStatusCodeForAvailability()` helper

4. **`src/models/character/overview/index.ts`**
   - Removed temporary `isPrivate` field (now handled at controller level)

## Key Design Decisions

### 1. Controller-Level, Not Model-Level
- Availability is a concern of the fetch/response layer, not the data model
- Models remain clean and focused on data structure
- Controllers handle HTTP concerns (status codes, error responses)

### 2. Composable Detectors
- Detectors are functions that can be chained
- Easy to add new detection logic without modifying core code
- Can be reused across different page types or customized per endpoint

### 3. Always Parse Data
- Even for private/error states, we attempt to parse what data is available
- Private profiles still return name, world, headshot, etc.
- Gives clients maximum information even in degraded states

### 4. Consistent Response Format
- All endpoints now return `PageResult<T>` structure
- Clients can check `availability` field to understand what to expect
- HTTP status codes still follow REST conventions

### 5. Non-Breaking for Internal Use
- Old `loadObjectFromUrl()` still exists
- New function is opt-in via `loadObjectFromUrlWithAvailability()`
- Gradual migration path for existing code

## API Response Examples

### Available (200)
```json
{
  "availability": "available",
  "data": { "name": "...", "levels": [...], ... },
  "statusCode": 200
}
```

### Private (200)
```json
{
  "availability": "private",
  "data": { "name": "...", "world": "..." },
  "statusCode": 200
}
```

### Forbidden (403)
```json
{
  "availability": "forbidden",
  "statusCode": 403
}
```

### Not Found (404)
```json
{
  "availability": "not_found",
  "statusCode": 404
}
```

## Testing

Run the test suite:
```bash
node --loader ts-node/esm test/scripts/test_availability.ts
```

Results:
- ✅ Public profiles return AVAILABLE with full data
- ✅ Private profiles return PRIVATE with partial data
- ✅ 403 responses return FORBIDDEN
- ✅ 404 responses return NOT_FOUND
- ✅ Same mechanism works for all page types

## Benefits

1. **Handles edge cases gracefully** - No more mysterious parsing errors
2. **Consistent across endpoints** - Character, FC, Levels all work the same way
3. **Informative responses** - Clients know exactly what state they're dealing with
4. **Extensible** - Easy to add new detection cases (maintenance mode, etc.)
5. **Backwards compatible** - Can be adopted gradually

## Future Extensions

Easy to add:
- Maintenance mode detection
- Rate limiting detection
- FC-specific privacy states
- Custom detectors per endpoint type
- Metrics/logging on availability states

