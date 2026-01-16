/**
 * Linkshell member rank enumeration
 */
export enum LinkshellRankType {
    MASTER = "MASTER",
    LEADER = "LEADER",
    MEMBER = "MEMBER",
    INVITEE = "INVITEE"
}

/**
 * Map raw linkshell rank name to enum value
 */
export function parseLinkshellRank(rankName: string | null | undefined): LinkshellRankType {
    if (!rankName) {
        return LinkshellRankType.MEMBER;
    }

    const normalized = rankName.trim().toUpperCase();

    switch (normalized) {
        case "MASTER":
            return LinkshellRankType.MASTER;
        case "LEADER":
            return LinkshellRankType.LEADER;
        case "INVITEE":
            return LinkshellRankType.INVITEE;
        default:
            return LinkshellRankType.MEMBER;
    }
}

