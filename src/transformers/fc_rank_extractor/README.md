# Free Company Rank Extractor

Efficiently discovers and analyzes Free Company rank hierarchies with minimal API requests.

## Architecture

### Entry Points

#### `RankScanner` - Efficient Discovery
For when you need to discover ranks with minimal HTTP requests.

```typescript
import {extractFreeCompanyRanks} from './fc_rank_extractor';

const result = await extractFreeCompanyRanks('9233786610993190251', {
    delayMs: 50,
    preloadPages: 2
});
// Scans efficiently, typically checking only 3-6 pages instead of all 10
```

**When to use:** `/ranks` endpoint or when you specifically need rank information

#### `RankAnalyzer` - Post-Processing
For when you already have all pages fetched (e.g., from aggregatePages).

```typescript
import {extractRanksFromPages} from './fc_rank_extractor';

// Pages already fetched by aggregatePages
const pages = [page1, page2, page3, ...];
const ranks = extractRanksFromPages(pages);
// No HTTP requests - just analyzes existing data
```

**When to use:** `/member` endpoint where you're already fetching all pages

### Supporting Classes


#### `RankTracker` - Shared Logic
- Calculates ordinal positions (100-based)
- Tracks rank occurrences across pages
- Manages page size detection
- Generates sorted results
- Used by both `RankScanner` and `RankAnalyzer`

#### `RankUtils` - Utilities
- `getRankKey()` - Creates unique identifier for ranks
- `getRankAt()` - Gets rank at specific position on page
- `sameRank()` - Compares two ranks for equality

## Files

```
fc_rank_extractor/
├── index.ts           - Public API entry point
├── types.ts           - Type definitions
├── fetcher.ts         - RankScanner class (binary search + HTTP)
├── extractor.ts        - RankAnalyzer class (post-processing)
├── rank_tracker.ts    - RankTracker class (shared logic)
└── utils.ts           - RankUtils class (utilities)
```

## Algorithm Overview

### RankScanner (Binary Search)

1. **Initial Fetch**: Load page 1 to get total pages
2. **Smart Preload**: 
   - Check if last rank of page N matches first rank of end page
   - If same: Stop preloading (no transitions between them)
   - If different: Fetch next page and repeat
3. **Binary Search**:
   - Compare first ranks of boundary pages
   - If same: Skip range (no transitions)
   - If different: Recursively search middle
4. **Result**: Return sorted ranks

**Example:**
```
FC with 10 pages:
- Page 1-2: Various high ranks
- Page 2 ends with "Member" 
- Page 10 starts with "Member"
- Algorithm: Fetches pages 1, 2, 10 only (3 pages instead of 10)
```

### RankAnalyzer (Sequential)

1. **Detect page size** from first full page
2. **Iterate all pages** sequentially
3. **For each member**: Calculate ordinal and track rank
4. **Sort and return** results

**Example:**
```
Already have pages 1-10 in memory:
- Iterates through all members
- Tracks each unique rank seen
- Returns sorted list
- Zero HTTP requests
```

## Ordinal-Based Ranking

Ranks are ordered by the ordinal position of the first member with that rank:

```
ordinal = 100 + (page - 1) × pageSize + positionOnPage
```

**Example:**
- First member on page 1 = ordinal 100
- 18th member on page 2 (pageSize=50) = ordinal 168
  - 100 + (2-1) × 50 + 18 = 168

**Benefits:**
- Hierarchical ordering (lower = higher rank)
- Adapts to actual page size (no hardcoding)
- Semantic meaning (ordinal position in FC)

## Usage Examples

### Efficient Discovery (RankScanner)
```typescript
const result = await extractFreeCompanyRanks('9233786610993190251');

console.log(`Found ${result.ranks.length} ranks`);
console.log(`Checked ${result.metadata.pagesChecked}/${result.metadata.totalPages} pages`);

result.ranks.forEach((rank, index) => {
    console.log(`${index + 1}. ${rank.name} (${rank.memberCount} members)`);
});
```

### Post-Processing (RankAnalyzer)
```typescript
// After fetching all pages
const result = await aggregatePages(url, FreeCompanyMembers, ...);

// Extract ranks from already-fetched pages
const ranks = extractRanksFromPages(result.pages);

return {
    members: result.items,
    ranks: ranks, // Only if result.metadata.complete
    metadata: result.metadata
};
```

## Performance

Typical Free Company with 10 pages, 500 members, 8 ranks:

| Approach | HTTP Requests | Time |
|----------|--------------|------|
| Naive (all pages) | 10 | ~1000ms |
| RankScanner | 3-6 | ~300-600ms |
| RankAnalyzer | 0* | ~5ms |

*Assumes pages already fetched

## API Response

```typescript
interface RankResponseObject {
    name: string;         // "FC Master", "Officer", etc.
    iconUrl: string;      // Lodestone icon URL
    memberCount: number;  // Number of members with this rank
}
```

## Testing

```bash
# Test scanner (efficient discovery)
curl "http://localhost:8787/freecompany/{id}/ranks"

# Test analyzer (with complete member list)
curl "http://localhost:8787/freecompany/{id}/member"
```

## Future Enhancements

- [ ] Add rank statistics (min/max/avg members per rank)
- [ ] Cache results in KV storage
- [ ] Add page range information back to response
- [ ] Support custom rank ordering

