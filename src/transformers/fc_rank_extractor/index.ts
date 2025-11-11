import {RankFetcher} from "./fetcher";
import {RankResponseObject, RankSearchOptions, RankSearchResultMetadata} from "./types";

/**
 * Scans a Free Company's member list to discover unique ranks using binary search
 * to minimize the number of requests needed.
 *
 * The algorithm works by:
 * 1. Fetching the first and last pages to determine total pages and boundary ranks
 * 2. Smart preloading: Checks if rank transitions exist before fetching additional pages
 * 3. Using binary search to find rank boundaries efficiently
 * 4. Skipping pages when we can determine no new ranks exist in a range
 *
 * @param fcId - The Free Company ID
 * @param options - Options for fetching pages
 * @returns Array of unique ranks with their positions and metadata
 */
export async function findFreeCompanyRanks(
    fcId: string,
    options: RankSearchOptions = {}
): Promise<{ ranks: RankResponseObject[], metadata: RankSearchResultMetadata }> {
    const fetcher = new RankFetcher(fcId, options);
    return await fetcher.scan();
}

// Re-export types and analyzer for convenience
export type {RankResponseObject, RankSearchOptions, RankSearchResultMetadata} from "./types";
export {extractRanksFromPages, RankExtractor} from "./extractor";

