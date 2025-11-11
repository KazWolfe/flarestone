import {FreeCompanyMembers} from "../../models/free_company/members";
import {RankResponseObject} from "./types";
import {RankTracker} from "./rank_tracker";

/**
 * Extracts ranks from a collection of already-fetched pages.
 * This is useful when you've already fetched all pages (e.g., via aggregatePages)
 * and want to extract rank information without additional HTTP requests.
 */
export class RankExtractor {
    private readonly rankTracker = new RankTracker();

    /**
     * Analyze a set of pages to extract rank information
     * @param pages Array of FreeCompanyMembers pages (must be in order)
     * @returns Array of ranks sorted by hierarchical order
     */
    extract(pages: FreeCompanyMembers[]): RankResponseObject[] {
        if (pages.length === 0) {
            return [];
        }

        // Determine page size from first page (assuming all pages except last are full)
        if (pages.length > 1 && pages[0].members.length > 0) {
            this.rankTracker.setPageSize(pages[0].members.length);
        }

        // Extract ranks from all pages
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            const pageNumber = pageIndex + 1; // Pages are 1-indexed
            this.rankTracker.extractRanksFromPage(page, pageNumber);
        }

        // Return sorted results
        return this.rankTracker.getRanksSorted();
    }
}

/**
 * Convenience function to extract ranks from already-fetched pages
 * @param pages Array of FreeCompanyMembers pages (must be in order)
 * @returns Array of ranks sorted by hierarchical order
 */
export function extractRanksFromPages(pages: FreeCompanyMembers[]): RankResponseObject[] {
    const analyzer = new RankExtractor();
    return analyzer.extract(pages);
}

