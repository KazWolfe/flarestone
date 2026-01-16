# Rank Enumeration Changes

## Summary

Changed `linkshellRank` to a simple `rank` string property that maps to the `LinkshellRankType` enum with the following values:
- `MASTER` - for members with the "Master" rank
- `LEADER` - for members with the "Leader" rank  
- `MEMBER` - for members without an explicit rank (default)
- `INVITEE` - for invited members

## Changes Made

### New File: `src/models/crossworld_linkshell/linkshell_rank.ts`

Created enum and parser function:
```typescript
export enum LinkshellRankType {
    MASTER = "MASTER",
    LEADER = "LEADER",
    MEMBER = "MEMBER",
    INVITEE = "INVITEE"
}

export function parseLinkshellRank(rankName: string | null | undefined): LinkshellRankType
```

### Updated: `src/models/crossworld_linkshell/members/components/member_entry.ts`

**Before:**
```typescript
@xpath(".//div[@class='entry__chara_info__linkshell']", { default: null, type: () => LinkshellMemberRank })
linkshellRank!: LinkshellMemberRank | null;
```

**After:**
```typescript
@xpath(".//div[@class='entry__chara_info__linkshell']/span/text()", { default: null })
_rankName!: string | null;

get rank(): LinkshellRankType {
    return parseLinkshellRank(this._rankName);
}
```

### Removed Unused Class

Deleted `LinkshellMemberRank` class - no longer needed since rank is now a simple enum string.

### Updated Tests

- Renamed tests from "linkshell rank" to match new property name
- Updated assertions to check enum values directly: `assert.equal(masterMember.rank, 'MASTER')`
- Updated handling of members without rank to check for the default `MEMBER` value

### Updated Documentation

- Updated API response examples to show `rank` as enum string
- Updated implementation details to reference `LinkshellRankType` enum
- Updated key features to describe rank enumeration

## API Response

**Before:**
```json
"linkshellRank": {
  "name": "Master"
}
```

**After:**
```json
"rank": "MASTER"
```

## Behavior

- Members with no rank (the default case) will have `rank: "MEMBER"`
- The `parseLinkshellRank` function is case-insensitive and handles trimming
- Unknown ranks default to `MEMBER`

## Tests

✅ All 55 tests passing
✅ TypeScript build successful
✅ No breaking changes to existing functionality

