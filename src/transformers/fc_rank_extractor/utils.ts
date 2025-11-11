import {RankInfo} from "../../models/free_company/members/components/member_entry";
import {FreeCompanyMembers} from "../../models/free_company/members";

/**
 * Utility functions for working with ranks
 */
export class RankUtils {
    /**
     * Create a unique key for a rank based on name and icon URL
     */
    static getRankKey(rank: RankInfo): string {
        return `${rank.name}|${rank.iconUrl}`;
    }

    /**
     * Get a member's rank from a page by index (0 = first, -1 = last)
     */
    static getRankAt(page: FreeCompanyMembers, index: number): RankInfo | null {
        if (page.members.length === 0) return null;
        const actualIndex = index < 0 ? page.members.length + index : index;
        return page.members[actualIndex]?.rank ?? null;
    }

    /**
     * Check if two ranks are the same
     */
    static sameRank(rank1: RankInfo | null, rank2: RankInfo | null): boolean {
        if (!rank1 || !rank2) return false;
        return this.getRankKey(rank1) === this.getRankKey(rank2);
    }
}

