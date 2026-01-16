# Linkshell Implementation

This document describes the Linkshell API implementation, which follows the same pattern as Cross-World Linkshells (CWLS) with one key difference: linkshells are restricted to a single world on a single datacenter.

## Overview

The Linkshell endpoints provide access to regular linkshell information including overview details and member lists with pagination support.

## API Endpoints

### Get Linkshell Overview

```
GET /linkshell/:id
```

Returns basic information about a Linkshell, including the world and datacenter (extracted from the first member).

**Response:**
```json
{
  "name": "Astral Nightstriders",
  "world": "Golem",
  "datacenter": "Dynamis",
  "iconUrl": "https://lds-img.finalfantasyxiv.com/...",
  "communityFinderUrl": null
}
```

**Note:** Unlike Cross-World Linkshells, regular linkshells are restricted to a single world on a single datacenter. The `world` and `datacenter` fields are extracted from the first member's information.

### Get Linkshell Members

```
GET /linkshell/:id/member
```

Returns a paginated list of all members from a Linkshell. Uses the `aggregatePages` utility to automatically fetch all pages.

**Query Parameters:**
- `maxPages`: Maximum number of pages to fetch (e.g., `?maxPages=5`)
- `maxItems`: Maximum number of items to return (e.g., `?maxItems=100`)

**Response:**
```json
{
  "members": [
    {
      "name": "Marie Mercier",
      "id": "58930722",
      "world": "Golem",
      "datacenter": "Dynamis",
      "lodestoneUrl": "/lodestone/character/58930722/",
      "avatarUrl": "https://img2.finalfantasyxiv.com/f/...",
      "classJob": {
        "level": 95,
        "name": "Dark Knight",
        "iconUrl": "https://lds-img.finalfantasyxiv.com/..."
      },
      "grandCompany": {
        "name": "Order of the Twin Adder",
        "rank": "Second Serpent Lieutenant",
        "iconUrl": "https://lds-img.finalfantasyxiv.com/..."
      },
      "rank": "MASTER",
      "freeCompany": {
        "name": "Astral Nightstriders",
        "id": "9281215144568832219",
        "lodestoneUrl": "/lodestone/freecompany/9281215144568832219/",
        "crest": {
          "background": "https://img2.finalfantasyxiv.com/c/...",
          "frame": "https://img2.finalfantasyxiv.com/c/...",
          "symbol": "https://img2.finalfantasyxiv.com/c/..."
        }
      }
    }
  ],
  "metadata": {
    "totalPages": 1,
    "pagesFetched": 1,
    "complete": true
  }
}
```

## Implementation Details

### Models

- **LinkshellOverview**: Parses the linkshell overview page including name, icon, world, datacenter, and Community Finder recruitment status
  - World and datacenter are extracted from the first member (at least one member always exists)
- **LinkshellMembers**: Implements `IPagedPage` to handle paginated member lists
- **LinkshellMemberEntry**: Represents a single member entry with all relevant data
- **LinkshellRankType**: Enum for linkshell member ranks (MASTER, LEADER, MEMBER, INVITEE)

### Key Differences from CWLS

1. **World/Datacenter in Overview**: Linkshells include `world` and `datacenter` fields in the overview, extracted from the first member
2. **Single World Restriction**: All members in a linkshell must be from the same world
3. **No Formation Date**: Unlike CWLS, regular linkshells don't have a formation date field

### Key Features

1. **Pagination Support**: The members endpoint uses `aggregatePages` to automatically follow pagination links and collect all members
2. **Optional Data**: Handles optional fields like Free Company membership and linkshell rank
3. **Community Finder Detection**: Returns the Community Finder recruitment link if the linkshell is recruiting (null otherwise)
4. **World/Datacenter Extraction**: Automatically extracts world and datacenter from the first member
5. **Rank Enumeration**: Linkshell rank is returned as an enumerated string (MASTER, LEADER, MEMBER, INVITEE)
6. **Nested Crest Data**: Free Company crest information is nested inside the freeCompany object
7. **ID Extraction**: Character and FC IDs are automatically extracted from URLs for convenience

## Comparison with CWLS

| Feature | Linkshell | CWLS |
|---------|-----------|------|
| World Restriction | Single world only | Cross-world |
| Datacenter Info | In overview (from first member) | In overview (native field) |
| Formation Date | No | Yes |
| Member Structure | Same | Same |
| Rank System | Same (MASTER, LEADER, MEMBER, INVITEE) | Same |

## Testing

Run tests with:
```bash
npm test
```

Tests verify:
- Correct parsing of all linkshell fields including world/datacenter
- Pagination metadata extraction
- Handling of optional fields (FC membership, linkshell rank)
- Community Finder detection
- Member data extraction and aggregation
- Members without Free Company

## Notes

- The implementation delays requests by 100ms between pages to be courteous to the Lodestone server
- World and datacenter are extracted from the first member's info since at least one member always exists
- All members in a linkshell are from the same world, so extracting from the first member is sufficient
- Optional fields that may not exist for all members are properly handled with default null values

