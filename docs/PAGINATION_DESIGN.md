# Pagination Aggregation Design

## Summary

I've implemented a **utility function approach** for aggregating multi-page results that maintains your XPath "magic" while being explicit and flexible.

## What Was Added

### 1. Core Aggregation Utilities (`src/page_aggregator.ts`)

Two main functions:

- **`aggregatePages()`** - Returns items + metadata (pages fetched, total pages, etc.)
- **`aggregateItems()`** - Returns just the aggregated items array (simpler)

### 2. Key Features

✅ **Maintains the Magic**: Your existing `FreeCompanyMembers` class doesn't change at all  
✅ **Type Safe**: Full TypeScript support with proper generics  
✅ **Flexible**: Control which field to aggregate, max pages, rate limiting  
✅ **Metadata**: Access to pagination info and per-page results if needed  
✅ **Error Handling**: Proper error handling with clear error messages  
✅ **Non-Breaking**: Existing code continues to work exactly as before  

## Usage

```typescript
import { aggregatePages, aggregateItems } from './magic';
import { FreeCompanyMembers } from './models/members/free_company_members';

// Simple - just get all members
const allMembers = await aggregateItems(
    'https://na.finalfantasyxiv.com/lodestone/freecompany/123/member',
    FreeCompanyMembers,
    (page) => page.members
);

// Advanced - get full result with metadata
const result = await aggregatePages(
    'https://na.finalfantasyxiv.com/lodestone/freecompany/123/member',
    FreeCompanyMembers,
    (page) => page.members,
    {
        baseUrl: 'https://na.finalfantasyxiv.com',
        delayMs: 100,
        maxPages: 10
    }
);
```

## Design Decisions

### Why This Approach?

I considered three options:

**Option 1: Utility Functions** ✅ **(Implemented)**
- Pros: Clean, explicit, flexible, doesn't break existing code
- Cons: Requires calling a separate function

**Option 2: Decorator-Based Auto-Aggregation**
- Pros: More "magical", less code at call site
- Cons: Implicit behavior, harder to control, breaks single-page use cases

**Option 3: Separate Aggregated Model Classes**
- Pros: Type-safe, clear intent
- Cons: Duplication, maintenance burden, loses some magic

### Why Option 1 Won

1. **Explicit is Better**: Developers consciously choose when to aggregate vs. get single page
2. **Flexibility**: Easy to add rate limiting, max pages, custom processing
3. **No Breaking Changes**: Existing single-page usage works exactly as before
4. **Testability**: Easy to mock and test
5. **Follows Your Pattern**: Similar to `loadObjectFromUrl()` - utility functions that work with your decorated classes

## How It Works

```
Your Code:
┌─────────────────────┐
│ FreeCompanyMembers  │  <- Your existing model, unchanged
│ @xpath decorators   │     Still uses XPath magic!
└─────────────────────┘
         ↓
Aggregator:
┌─────────────────────┐
│ aggregatePages()    │  <- Fetches page 1
└──────────���──────────┘
         ↓
    Parse with your
    existing magic
         ↓
┌─────────────────────┐
│ Extract items       │  <- (page) => page.members
└─────────────────────┘
         ↓
┌─────────────────────┐
│ Follow next page    │  <- page.getNextPageUrl()
└─────────────────────┘
         ↓
    Repeat until done
         ↓
┌─────────────────────┐
│ Return aggregated   │
│ items + metadata    │
└─────────────────────┘
```

## Files Created

1. **`src/page_aggregator.ts`** - Core aggregation utilities
2. **`src/examples/pagination_examples.ts`** - Comprehensive examples
3. **`docs/PAGINATION_AGGREGATION.md`** - User documentation
4. **`src/index.ts`** - Updated to re-export aggregation utilities

## Example Integration

Updated `FreeCompanyController` with a new method:

```typescript
async getAllFreeCompanyMembers(request: IRequest): Promise<Response> {
    const result = await aggregatePages(
        `https://na.finalfantasyxiv.com/lodestone/freecompany/${request.params.id}/member`,
        FreeCompanyMembers,
        (page) => page.members,
        {
            baseUrl: 'https://na.finalfantasyxiv.com',
            delayMs: 100
        }
    );

    return new Response(JSON.stringify({
        members: serializeForJson(result.items),
        metadata: result.metadata
    }), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
    });
}
```

## Future Enhancements

Possible improvements:
- Parallel page fetching with concurrency control
- Built-in caching/memoization
- Progress callbacks for long operations
- Retry logic with exponential backoff
- Stream-based API for very large result sets

## Questions?

The approach is:
- ✅ Type-safe
- ✅ Non-breaking
- ✅ Maintains your XPath magic
- ✅ Explicit and clear
- ✅ Flexible and extensible
- ✅ Well documented with examples

Let me know if you'd like any adjustments!

