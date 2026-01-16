# CWLS Quick Start

## File Structure Created

```
Flarestone-XPath/
├── src/
│   ├── controllers/
│   │   └── crossworld_linkshell_controller.ts       # API endpoints
│   └── models/
│       └── crossworld_linkshell/
│           ├── overview/
│           │   ├── index.ts                         # CrossworldLinkshellOverview
│           │   └── components/
│           │       └── linkshell_rank.ts            # LinkshellRank
│           └── members/
│               ├── index.ts                         # CrossworldLinkshellMembers
│               └── components/
│                   └── member_entry.ts              # LinkshellMemberEntry
├── test/
│   └── models/
│       ├── cwls_members.test.ts                     # Member parsing tests
│       └── cwls_overview.test.ts                    # Overview parsing tests
└── docs/
    ├── CWLS_IMPLEMENTATION.md                       # Full API docs & patterns
    └── CWLS_SUMMARY.md                              # Implementation summary
```

## API Usage

### Get CWLS Overview
```bash
curl "https://api.example.com/crossworld_linkshell/6841671b0c0e6045e9f57e6d432c9fdb196134bc"
```

**Response:**
```json
{
  "name": "Fae Hollow",
  "datacenter": "Crystal",
  "iconUrl": "https://lds-img.finalfantasyxiv.com/h/5/4_6qlZUYui4tW5ktSgjd-uYbxk.png",
  "formed": "2026-12-14T03:48:13.000Z",
  "recruitingToCommunityFinder": false
}
```

### Get All CWLS Members (with pagination)
```bash
curl "https://api.example.com/crossworld_linkshell/6841671b0c0e6045e9f57e6d432c9fdb196134bc/member"
```

**With limits:**
```bash
curl "https://api.example.com/crossworld_linkshell/6841671b0c0e6045e9f57e6d432c9fdb196134bc/member?maxPages=2&maxItems=50"
```

## Key Classes

### CrossworldLinkshellOverview
Parses the CWLS overview page. Properties:
- `name` - CWLS name
- `datacenter` - Datacenter name
- `iconUrl` - Icon image URL
- `formed` - Formation date (Date object)
- `communityFinderUrl` - Link to Community Finder listing (if recruiting)
- `recruitingToCommunityFinder` - Boolean flag

### CrossworldLinkshellMembers
Implements `IPagedPage` for member list parsing. Provides:
- `members` - Array of `LinkshellMemberEntry`
- `getCurrentPage()`, `getTotalPages()`, `getNextPageUrl()` - Pagination methods
- `pagination` - Object with pagination metadata

### LinkshellMemberEntry
Individual member data including:
- `name`, `world`, `datacenter` - Basic identity
- `lodestoneUrl`, `avatarUrl` - Links/images
- `classJob` - Class/job level
- `grandCompany` - GC affiliation (can be null)
- `linkshellInfo` - Linkshell rank (can be null)
- `freeCompany` - FC membership (can be null)
- `freeCompanyCrest` - FC crest graphics (can be null)

## Testing

Run all tests:
```bash
npm test
```

Run only CWLS tests:
```bash
npm test test/models/cwls_*.test.ts
```

## Adding Linkshells/PvP Teams

To add similar endpoints for regular Linkshells or PvP Teams:

1. **Create model structure:**
   ```
   src/models/linkshell/
   ├── overview/index.ts
   └── members/
       ├── index.ts
       └── components/member_entry.ts
   ```

2. **Adapt XPath selectors** in member_entry.ts and overview/index.ts to match actual Lodestone HTML

3. **Create controller:**
   ```
   src/controllers/linkshell_controller.ts
   ```

4. **Register routes** in src/worker.ts:
   ```typescript
   router.get('/linkshell/:id', (request) => linkshellController.getLinkshell(request));
   router.get('/linkshell/:id/member', (request) => linkshellController.getLinkshellMembers(request));
   ```

5. **Add tests** following cwls_overview.test.ts and cwls_members.test.ts patterns

## Fixtures

Located in `test/fixtures/crossworld_linkshells/`:
- `cwls.html` - Single-page CWLS without Community Finder recruitment
- `cwls_recruiting.html` - CWLS with Community Finder recruitment
- `cwls_paged.html` - Multi-page CWLS for pagination testing

These fixtures were used to verify the implementation handles:
- Various member configurations
- Optional fields (FC, linkshell rank)
- Single and multi-page results
- Community Finder detection

