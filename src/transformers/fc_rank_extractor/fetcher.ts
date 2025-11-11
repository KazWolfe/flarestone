import {RankResponseObject, RankSearchOptions, RankSearchResultMetadata} from "./types";
import {RankUtils} from "./utils";
import {RankTracker} from "./rank_tracker";
import {loadObjectFromUrl} from "../../engine";
import {FreeCompanyMembers} from "../../models/free_company/members";

/**
 * Scans a Free Company's member list to discover unique ranks using binary search
 * to minimize the number of requests needed.
 */
export class RankFetcher {
    private readonly rankTracker = new RankTracker();
    private readonly preloadPages: number;

    // HTTP and caching state
    private readonly memberUrl: string;
    private readonly delayMs: number;
    private readonly pageCache = new Map<number, FreeCompanyMembers>();
    private readonly checkedPages = new Set<number>();

    constructor(
        fcId: string,
        options: RankSearchOptions = {}
    ) {
        const baseUrl = options.baseUrl || 'https://na.finalfantasyxiv.com';
        this.memberUrl = `${baseUrl}/lodestone/freecompany/${fcId}/member`;
        this.delayMs = options.delayMs || 50;
        this.preloadPages = options.preloadPages ?? 2;
    }

    /**
     * Scan the Free Company to discover all ranks
     */
    async scan(): Promise<{ ranks: RankResponseObject[], metadata: RankSearchResultMetadata }> {
        // Step 1: Fetch the first page to get total pages
        const firstPage = await this.fetchPage(1);
        const totalPages = firstPage.getTotalPages();

        // If there's only one page, we're done
        if (totalPages === 1) {
            return {
                ranks: this.getFinalResults(),
                metadata: {
                    totalPages,
                    pagesChecked: Array<number>(...this.checkedPages)
                }
            };
        }

        // Step 2: Smart preloading
        await this.smartPreload(totalPages);

        // Step 3: Binary search for remaining rank boundaries
        let currentPreloadPage = 1;
        while (currentPreloadPage < Math.min(this.preloadPages, totalPages - 1) &&
               this.pageCache.has(currentPreloadPage + 1)) {
            currentPreloadPage++;
        }
        await this.searchRange(currentPreloadPage, totalPages);

        return {
            ranks: this.getFinalResults(),
            metadata: {
                totalPages,
                pagesChecked: Array<number>(...this.checkedPages)
            }
        };
    }

    /**
     * Smart preloading: only fetch next page if current page's last rank differs from end page's first rank
     */
    private async smartPreload(totalPages: number): Promise<void> {
        let currentPreloadPage = 1;
        const maxPreloadPage = Math.min(this.preloadPages, totalPages - 1);

        while (currentPreloadPage < maxPreloadPage) {
            const currentPageData = this.getCached(currentPreloadPage);
            const endPageData = await this.fetchPage(totalPages);

            // If the last rank of current page matches the first rank of the end page,
            // there's no transition between them, so we can stop preloading
            if (RankUtils.sameRank(
                RankUtils.getRankAt(currentPageData, -1),
                RankUtils.getRankAt(endPageData, 0)
            )) {
                break;
            }

            // There's a transition somewhere, so fetch the next page
            currentPreloadPage++;
            await this.fetchPage(currentPreloadPage);
        }
    }

    /**
     * Binary search to find rank boundaries in a range of pages.
     *
     * Key insight: Members are ordered by rank across ALL pages.
     * We only need to look at the FIRST member of each page to find rank transitions.
     */
    private async searchRange(startPage: number, endPage: number): Promise<void> {
        // Base case: invalid range
        if (startPage >= endPage) {
            return;
        }

        // Fetch boundary pages if not already fetched
        const startPageData = await this.fetchPage(startPage);
        const endPageData = await this.fetchPage(endPage);

        // If pages are adjacent, we're done with this range
        if (endPage - startPage <= 1) {
            return;
        }

        // Get the first rank of start and end pages
        const firstRankOfStart = RankUtils.getRankAt(startPageData, 0);
        const firstRankOfEnd = RankUtils.getRankAt(endPageData, 0);

        // If both pages start with the same rank, no transition in this range
        if (RankUtils.sameRank(firstRankOfStart, firstRankOfEnd)) {
            return;
        }

        // Critical optimization: Check if the last rank of start page equals first rank of end page
        // If so, there's no rank transition between these pages (same rank spans the gap)
        if (RankUtils.sameRank(RankUtils.getRankAt(startPageData, -1), firstRankOfEnd)) {
            return;
        }

        // Different ranks, so there's a transition somewhere in between
        // Check the middle page to narrow down where it is
        const midPage = Math.floor((startPage + endPage) / 2);
        const midPageData = await this.fetchPage(midPage);
        const firstRankOfMid = RankUtils.getRankAt(midPageData, 0);

        // Recurse based on where the transition is
        if (RankUtils.sameRank(firstRankOfStart, firstRankOfMid)) {
            // Mid page has same first rank as start, so transition is in the right half
            await this.searchRange(midPage, endPage);
        } else if (RankUtils.sameRank(firstRankOfMid, firstRankOfEnd)) {
            // Mid page has same first rank as end, so transition is in the left half
            await this.searchRange(startPage, midPage);
        } else {
            // Mid page has a different rank from both - transitions in both halves
            await this.searchRange(startPage, midPage);
            await this.searchRange(midPage, endPage);
        }
    }

    /**
     * Get final results sorted by hierarchical order (ordinal position)
     */
    private getFinalResults(): RankResponseObject[] {
        return this.rankTracker.getRanksSorted();
    }

    /**
     * Get a cached page (throws if not cached)
     */
    private getCached(page: number): FreeCompanyMembers {
        const cached = this.pageCache.get(page);
        if (!cached) {
            throw new Error(`Page ${page} not in cache`);
        }
        return cached;
    }

    /**
     * Fetch a page and extract ranks from all members
     */
    private async fetchPage(page: number): Promise<FreeCompanyMembers> {
        if (this.pageCache.has(page)) {
            return this.pageCache.get(page)!;
        }

        const url = page === 1 ? this.memberUrl : `${this.memberUrl}?page=${page}`;
        const membersPage = await loadObjectFromUrl(url, FreeCompanyMembers);

        this.pageCache.set(page, membersPage);
        this.checkedPages.add(page);

        // Determine page size from first full page (not the last page which might be partial)
        if (membersPage.members.length > 0) {
            const totalPages = membersPage.getTotalPages();
            if (page < totalPages) {
                this.rankTracker.setPageSize(membersPage.members.length);
            }
        }

        // Extract all ranks from this page
        this.rankTracker.extractRanksFromPage(membersPage, page);

        // Add delay to be nice to the server
        if (this.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }

        return membersPage;
    }
}

