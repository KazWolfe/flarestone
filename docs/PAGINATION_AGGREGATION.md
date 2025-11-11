# Aggregating Paginated Results

This document explains how to aggregate results across multiple pages while maintaining the "magic" of XPath-based parsing.

## The Problem

When you have a paginated model like `FreeCompanyMembers`, each instance only contains data from a single page. The `members` array only has entries for that specific page.

## The Solution

Use the `aggregatePages()` or `aggregateItems()` functions from `page_aggregator.ts` to automatically fetch and combine results from all pages.

## Usage Examples

### Basic Usage - Get All Items

```typescript
import { aggregateItems } from './magic_aggregator';
import { FreeCompanyMembers } from './models/members/free_company_members';

// Simple: just get all members from all pages
const allMembers = await aggregateItems(
    'https://na.finalfantasyxiv.com/lodestone/freecompany/123456/member',
    FreeCompanyMembers,
    (page) => page.members
);

console.log(`Total members: ${allMembers.length}`);
```

### Advanced Usage - Get Full Result with Metadata

```typescript
import { aggregatePages } from './magic_aggregator';
import { FreeCompanyMembers } from './models/members/free_company_members';

const result = await aggregatePages(
    'https://na.finalfantasyxiv.com/lodestone/freecompany/123456/member',
    FreeCompanyMembers,
    (page) => page.members,
    {
        baseUrl: 'https://na.finalfantasyxiv.com', // For resolving relative URLs
        delayMs: 100, // Delay between requests to be nice to the server
        maxPages: 5   // Optional: limit number of pages to fetch
    }
);

console.log(`Fetched ${result.metadata.pagesFetched} of ${result.metadata.totalPages} pages`);
console.log(`Total members: ${result.items.length}`);
console.log(`Complete: ${result.metadata.complete}`);

// Access individual pages if needed
result.pages.forEach((page, index) => {
    console.log(`Page ${index + 1} has ${page.members.length} members`);
});
```

### In a Controller

```typescript
export default class FreeCompanyController {
    async getAllMembers(request: IRequest): Promise<Response> {
        const fcId = request.params.id;
        const baseUrl = `https://na.finalfantasyxiv.com/lodestone/freecompany/${fcId}/member`;
        
        const result = await aggregatePages(
            baseUrl,
            FreeCompanyMembers,
            (page) => page.members,
            {
                baseUrl: 'https://na.finalfantasyxiv.com',
                delayMs: 100
            }
        );

        return new Response(JSON.stringify({
            members: serializeForJson(result.items),
            pagination: result.metadata
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
```

### With Query Parameters

```typescript
// Handle existing query parameters in the URL
async function fetchAllWithFilters(fcId: string, filters: Record<string, string>) {
    const params = new URLSearchParams(filters);
    const baseUrl = `https://na.finalfantasyxiv.com/lodestone/freecompany/${fcId}/member?${params}`;
    
    return await aggregateItems(
        baseUrl,
        FreeCompanyMembers,
        (page) => page.members
    );
}
```

## How It Works

1. **Maintains the Magic**: Your existing `FreeCompanyMembers` class doesn't change at all. The XPath decorators still work exactly as before.

2. **Automatic Pagination**: The aggregator automatically:
   - Fetches the first page
   - Parses it using your class
   - Extracts items using your provided function
   - Follows the `getNextPageUrl()` to fetch subsequent pages
   - Repeats until all pages are fetched

3. **Type Safety**: TypeScript knows the exact types:
   - `T` is your page class (e.g., `FreeCompanyMembers`)
   - `TItem` is the item type (e.g., `MemberEntry`)
   - The return type is correctly inferred

4. **Flexible**: You control:
   - Which field to aggregate (`(page) => page.members`)
   - How many pages to fetch (`maxPages`)
   - Rate limiting (`delayMs`)
   - Access to per-page data if needed

## Alternative Approaches

### Option A: Manual Aggregation
If you need more control, you can manually loop:

```typescript
const allMembers = [];
let url: string | null = initialUrl;

while (url) {
    const page = await loadObjectFromUrl(url, FreeCompanyMembers);
    allMembers.push(...page.members);
    url = page.getNextPageUrl();
    
    if (url) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
```

### Option B: Create an Aggregated Model Class
Create a separate class that represents the aggregated result:

```typescript
export class AllFreeCompanyMembers {
    members: MemberEntry[];
    totalPages: number;
    
    static async fetch(baseUrl: string): Promise<AllFreeCompanyMembers> {
        const result = await aggregatePages(
            baseUrl,
            FreeCompanyMembers,
            (page) => page.members
        );
        
        const instance = new AllFreeCompanyMembers();
        instance.members = result.items;
        instance.totalPages = result.metadata.totalPages;
        return instance;
    }
}

// Usage
const allMembers = await AllFreeCompanyMembers.fetch(url);
```

## Design Principles

This approach was chosen because it:

1. **Doesn't break existing code**: Your `FreeCompanyMembers` class stays the same
2. **Keeps the magic**: XPath decorators still work exactly as before
3. **Is explicit**: Developers consciously choose when to aggregate
4. **Is flexible**: Works with any paginated model
5. **Is type-safe**: Full TypeScript support
6. **Is testable**: Easy to mock the fetch calls

## Future Enhancements

Possible additions:
- Parallel page fetching (with concurrency limits)
- Caching/memoization
- Progress callbacks
- Retry logic for failed requests
- Support for bidirectional pagination

