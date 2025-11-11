# Quick Reference: Pagination Aggregation

## TL;DR

```typescript
import { aggregateItems } from './magic';
import { FreeCompanyMembers } from './models/members/free_company_members';

// Get ALL members from ALL pages - that's it!
const allMembers = await aggregateItems(
    'https://na.finalfantasyxiv.com/lodestone/freecompany/YOUR_FC_ID/member',
    FreeCompanyMembers,
    (page) => page.members
);
```

## Two Functions

### 1. `aggregateItems()` - Simple (Returns array)
```typescript
const allMembers = await aggregateItems(url, PageClass, (p) => p.items);
```

### 2. `aggregatePages()` - Advanced (Returns items + metadata)
```typescript
const result = await aggregatePages(url, PageClass, (p) => p.items);
// result.items - all items
// result.metadata.totalPages - how many pages
// result.metadata.pagesFetched - pages fetched
// result.pages - individual page objects
```

## Options

```typescript
{
    maxPages: 5,        // Stop after N pages (default: Infinity)
    delayMs: 100,       // Delay between requests (default: 0)
    baseUrl: 'https://...'  // For resolving relative URLs
}
```

## Your Existing Code Still Works!

```typescript
// Single page - works exactly as before
const page1 = await loadObjectFromUrl(url, FreeCompanyMembers);
console.log(page1.members);  // Only page 1

// All pages - new capability
const allPages = await aggregateItems(url, FreeCompanyMembers, p => p.members);
console.log(allPages);  // All pages combined
```

## Files to Check Out

1. **`src/page_aggregator.ts`** - Core implementation
2. **`src/examples/fc_members_aggregation_example.ts`** - Real examples with your FC model
3. **`docs/PAGINATION_AGGREGATION.md`** - Full documentation
4. **`IMPLEMENTATION_SUMMARY.md`** - Complete overview

## That's It!

Your `FreeCompanyMembers` class **doesn't change at all**. Just use the new `aggregateItems()` or `aggregatePages()` functions when you want all pages instead of one.

