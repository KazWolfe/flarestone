# Cross-World Linkshell (CWLS) Implementation

This document describes the Cross-World Linkshell API implementation and the reusable patterns used for similar community structures.

## Overview

The CWLS endpoints provide access to Cross-world Linkshell information including overview details and member lists with pagination support.

## API Endpoints

### Get CWLS Overview

```
GET /crossworld_linkshell/:id
```

Returns basic information about a Cross-world Linkshell.

**Response:**
```json
{
  "name": "Fae Hollow",
  "datacenter": "Crystal",
  "iconUrl": "https://lds-img.finalfantasyxiv.com/...",
  "formed": "2026-12-14T03:48:13.000Z",
  "communityFinderUrl": null
}
```

### Get CWLS Members

```
GET /crossworld_linkshell/:id/member
```

Returns a paginated list of all members from a Cross-world Linkshell. Uses the `aggregatePages` utility to automatically fetch all pages.

**Query Parameters:**
- `maxPages`: Maximum number of pages to fetch (e.g., `?maxPages=5`)
- `maxItems`: Maximum number of items to return (e.g., `?maxItems=100`)

**Response:**
```json
{
  "members": [
    {
      "name": "Mahvash Sunspell",
      "id": "22846522",
      "world": "Balmung",
      "datacenter": "Crystal",
      "lodestoneUrl": "/lodestone/character/22846522/",
      "avatarUrl": "https://img2.finalfantasyxiv.com/f/...",
      "classJob": {
        "level": 70,
        "name": "Dark Knight",
        "iconUrl": "https://lds-img.finalfantasyxiv.com/..."
      },
      "grandCompany": {
        "name": "Immortal Flames",
        "rank": "Flame Corporal",
        "iconUrl": "https://lds-img.finalfantasyxiv.com/..."
      },
      "rank": "MASTER",
      "freeCompany": {
        "name": "Nhaama's Embrace",
        "id": "9236179148295239677",
        "lodestoneUrl": "/lodestone/freecompany/9236179148295239677/",
        "crest": {
          "background": "https://img2.finalfantasyxiv.com/c/...",
          "frame": "https://img2.finalfantasyxiv.com/c/...",
          "symbol": "https://img2.finalfantasyxiv.com/c/..."
        }
      }
    }
  ],
  "metadata": {
    "totalPages": 2,
    "pagesFetched": 2,
    "complete": true
  }
}
```

## Implementation Details

### Models

- **CrossworldLinkshellOverview**: Parses the CWLS overview page including name, datacenter, formation date, and optional Community Finder recruitment link
- **CrossworldLinkshellMembers**: Implements `IPagedPage` to handle paginated member lists
- **LinkshellMemberEntry**: Represents a single member entry with all relevant data
- **LinkshellRankType**: Enum for linkshell member ranks (MASTER, LEADER, MEMBER, INVITEE)

### Key Features

1. **Pagination Support**: The members endpoint uses `aggregatePages` to automatically follow pagination links and collect all members
2. **Optional Data**: Handles optional fields like Free Company membership and linkshell rank
3. **Community Finder Detection**: Returns the Community Finder recruitment link if the CWLS is recruiting (null otherwise)
4. **World/Datacenter Parsing**: Extracts world and datacenter information from the "World [DataCenter]" format
5. **Rank Enumeration**: Linkshell rank is returned as an enumerated string (MASTER, LEADER, MEMBER, INVITEE)
6. **Nested Crest Data**: Free Company crest information is nested inside the freeCompany object

## Reusable Pattern for Linkshells and PvP Teams

This implementation establishes a reusable pattern for similar community structures (regular Linkshells and PvP Teams) that can be easily extended.

### Pattern Structure

The CWLS implementation follows this architecture:

```
src/models/crossworld_linkshell/
├── overview/
│   └── index.ts                    # Overview page model
└── members/
    ├── index.ts                    # Members page model (IPagedPage)
    └── components/
        └── member_entry.ts         # Individual member component

src/controllers/
└── crossworld_linkshell_controller.ts  # API endpoints

test/models/
├── cwls_overview.test.ts
└── cwls_members.test.ts
```

### How to Adapt for Linkshells and PvP Teams

To create similar endpoints for regular Linkshells (`/linkshell/:id`) or PvP Teams (`/pvp_team/:id`), follow these steps:

1. **Create Model Files** (similar structure):
   - `src/models/linkshell/overview/index.ts`
   - `src/models/linkshell/members/index.ts`
   - `src/models/linkshell/members/components/member_entry.ts`

2. **Adapt XPath Selectors**:
   - The HTML structure may differ slightly from CWLS
   - Update xpath selectors in member_entry.ts and overview/index.ts to match the actual Lodestone HTML
   - Reuse common components like `MiniClassJobInfo`, `MiniGrandCompanyInfo`, `WorldInfo`, and `CrestComponents` from `src/models/_common/common.ts`

3. **Create Controller**:
   - `src/controllers/linkshell_controller.ts` (follow `crossworld_linkshell_controller.ts` pattern)
   - Use same aggregation pattern with `aggregatePages`

4. **Register Routes** in `src/worker.ts`:
   ```typescript
   router.get('/linkshell/:id', (request) => linkshellController.getLinkshell(request));
   router.get('/linkshell/:id/member', (request) => linkshellController.getLinkshellMembers(request));
   ```

5. **Create Tests**:
   - Use existing fixtures or obtain new ones from Lodestone
   - Follow the test patterns in `cwls_overview.test.ts` and `cwls_members.test.ts`

### Shared Components

The following components are reusable across all community structures:

- `WorldInfo`: Parses "World [DataCenter]" format
- `MiniClassJobInfo`: Parses class/job level information
- `MiniGrandCompanyInfo`: Parses Grand Company affiliation and rank
- `MiniFreeCompanyInfo`: Parses Free Company membership
- `CrestComponents`: Parses FC/LS crest graphics
- `Pager`: Handles pagination metadata extraction

## Testing

Run tests with:
```bash
npm test
```

Tests verify:
- Correct parsing of all CWLS fields
- Pagination metadata extraction
- Handling of optional fields (FC membership, linkshell rank)
- Community Finder detection
- Member data extraction and aggregation

## Notes

- The implementation delays requests by 100ms between pages to be courteous to the Lodestone server
- All timestamps are provided in UTC format
- World and Datacenter information is parsed from the combined "World [DataCenter]" text
- Optional fields that may not exist for all members are properly handled with default null values

