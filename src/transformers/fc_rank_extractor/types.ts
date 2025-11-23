export interface RankResponseObject {
    /** The name of this rank. */
    name: string;

    /** The number of members with this rank. */
    memberCount: number;

    /** The icon URL for this rank. */
    iconUrl: string;
}

/**
 * Options for rank extraction
 */
export interface RankSearchOptions {
    baseUrl?: string;
    delayMs?: number;

    /**
     * Maximum number of initial pages to preload before binary search.
     *
     * Smart preloading: The algorithm checks if the last rank of the current page
     * matches the first rank of the end page. If they match, preloading stops early
     * since there can be no rank transitions between them.
     *
     * This is useful because most FCs have a small number of high-rank members
     * and many low-rank members, so rank transitions often occur in early pages.
     *
     * Default: 2
     */
    preloadPages?: number;

    /**
     * Fetch options to include with each request.
     */
    requestOpts?: RequestInit;
}

/**
 * Internal tracking structure for ranks during extraction
 */
export interface RankTracking {
    name: string;
    iconUrl: string;
    memberCount: number;
    firstSeenPage: number;
    lastSeenPage: number;
    firstSeenOrdinal: number;
}

/**
 * Metadata about the rank extraction process
 */
export interface RankSearchResultMetadata {
    totalPages: number;
    pagesChecked: Array<number>;
}

