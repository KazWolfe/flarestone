import {RankTracking, RankResponseObject} from "./types";
import {RankUtils} from "./utils";

/**
 * Shared rank tracking logic used by both PageFetcher and RankAnalyzer.
 * Handles rank discovery, ordinal calculation, and result generation.
 */
export class RankTracker {
    private readonly rankMap = new Map<string, RankTracking>();
    private pageSize: number | null = null;

    /**
     * Set the page size (number of members per page)
     */
    setPageSize(size: number): void {
        if (this.pageSize === null) {
            this.pageSize = size;
        }
    }

    /**
     * Get the current page size (or default to 50)
     */
    getPageSize(): number {
        return this.pageSize ?? 50;
    }

    /**
     * Calculate the ordinal position for a member
     * @param page Page number (1-indexed)
     * @param positionOnPage Position of member on the page (0-indexed)
     * @returns Ordinal position (100-based)
     */
    calculateOrdinal(page: number, positionOnPage: number): number {
        return 100 + (page - 1) * this.getPageSize() + positionOnPage;
    }

    /**
     * Update or add a rank in the tracking map
     */
    updateRank(rank: { name: string; iconUrl: string }, page: number, ordinal: number): void {
        const key = RankUtils.getRankKey(rank);
        const existing = this.rankMap.get(key);

        if (existing) {
            // Update page ranges and keep the lowest ordinal (first seen)
            if (ordinal < existing.firstSeenOrdinal) {
                existing.firstSeenPage = page;
                existing.firstSeenOrdinal = ordinal;
            }
            existing.lastSeenPage = Math.max(existing.lastSeenPage, page);
            existing.memberCount++;
        } else {
            this.rankMap.set(key, {
                name: rank.name,
                iconUrl: rank.iconUrl,
                firstSeenPage: page,
                lastSeenPage: page,
                firstSeenOrdinal: ordinal,
                memberCount: 1
            });
        }
    }

    /**
     * Get all tracked ranks sorted by hierarchical order
     */
    getRanksSorted(): RankResponseObject[] {
        return Array.from(this.rankMap.values())
            .sort((a, b) => a.firstSeenOrdinal - b.firstSeenOrdinal)
            .map(rank => ({
                name: rank.name,
                iconUrl: rank.iconUrl,
                memberCount: rank.memberCount
            }));
    }

    /**
     * Get the internal rank map (for advanced use cases)
     */
    getRankMap(): Map<string, RankTracking> {
        return this.rankMap;
    }

    /**
     * Extract ranks from a single page's members
     * @param page Page object with members array
     * @param pageNumber Page number (1-indexed)
     */
    extractRanksFromPage(page: { members: Array<{ rank?: { name: string; iconUrl: string } }> }, pageNumber: number): void {
        for (let memberIndex = 0; memberIndex < page.members.length; memberIndex++) {
            const member = page.members[memberIndex];
            if (member.rank) {
                const ordinal = this.calculateOrdinal(pageNumber, memberIndex);
                this.updateRank(member.rank, pageNumber, ordinal);
            }
        }
    }
}

