import 'reflect-metadata';
import {parseHtmlToDom, injectInto} from '../engine/injector';
import {IPagedPage} from '../models/parsable';
import {IRequest} from "itty-router";
import {fsFetch} from "../utils/fetch";

/**
 * Configuration for aggregating paginated results
 */
export interface PageAggregationOptions {
    /**
     * Maximum number of pages to fetch. Defaults to Infinity (all pages).
     */
    maxPages?: number;

    /**
     * Maximum number of items to fetch. Defaults to Infinity (all items).
     */
    maxItems?: number;

    /**
     * Optional base URL to resolve relative pagination URLs against.
     * If not provided, pagination URLs are assumed to be absolute or relative to the current origin.
     */
    baseUrl?: string;

    /**
     * Delay between page fetches in milliseconds to avoid rate limiting.
     * Defaults to 0.
     */
    delayMs?: number;
}

/**
 * Result of an aggregated page fetch, containing all items and metadata about the aggregation
 */
export interface AggregatedResult<T, TItem> {
    /**
     * All aggregated items from all pages
     */
    items: TItem[];

    /**
     * Array of individual page results (in case you need access to per-page data)
     */
    pages: T[];

    /**
     * Metadata about the aggregation
     */
    metadata: {
        totalPages: number;
        pagesFetched: number;
        complete: boolean; // false if stopped early due to maxPages
    };
}

/**
 * Aggregate all pages from a paginated endpoint by automatically following pagination links.
 *
 * @param initialUrl The URL of the first page
 * @param pageClass The class representing a single page (must implement IPagedPage)
 * @param itemExtractor A function that extracts the array of items from a parsed page
 * @param options Optional configuration for the aggregation
 *
 * @example
 * ```typescript
 * const result = await aggregatePages(
 *   'https://na.finalfantasyxiv.com/lodestone/freecompany/123/member',
 *   FreeCompanyMembers,
 *   (page) => page.members,
 *   { maxPages: 5, delayMs: 100 }
 * );
 *
 * console.log(result.items); // All members from all pages
 * console.log(result.metadata.pagesFetched); // How many pages were fetched
 * ```
 */
export async function aggregatePages<T extends IPagedPage, TItem>(
    initialUrl: string,
    pageClass: new () => T,
    itemExtractor: (page: T) => TItem[],
    options: PageAggregationOptions = {}
): Promise<AggregatedResult<T, TItem>> {
    const {maxPages = Infinity, maxItems = Infinity, baseUrl, delayMs = 0} = options;

    const pages: T[] = [];
    const allItems: TItem[] = [];
    let currentUrl: string | null = initialUrl;
    let pagesFetched = 0;

    while (currentUrl && pagesFetched < maxPages && allItems.length < maxItems) {
        // Fetch and parse the current page
        const res = await fsFetch(currentUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${currentUrl}: ${res.status}`);
        }
        const html = await res.text();
        const doc = parseHtmlToDom(html);
        const page = injectInto(doc, pageClass);

        // Extract items from this page
        const items = itemExtractor(page);
        allItems.push(...items);
        pages.push(page);
        pagesFetched++;

        // Check if we've reached maxItems - if so, stop even if there are more pages
        if (allItems.length >= maxItems) {
            break;
        }

        // Get the next page URL
        currentUrl = page.getNextPageUrl();

        // If we have a next page URL and it's relative, resolve it
        if (currentUrl && baseUrl && !currentUrl.startsWith('http')) {
            currentUrl = new URL(currentUrl, baseUrl).toString();
        }

        // Add delay between requests if configured
        if (currentUrl && delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    // Get total pages from the last fetched page
    const totalPages = pages.length > 0 ? pages[pages.length - 1].getTotalPages() : 0;

    // Trim items to maxItems if we went over
    const finalItems = allItems.slice(0, maxItems);

    return {
        items: finalItems,
        pages,
        metadata: {
            totalPages,
            pagesFetched,
            complete: (pagesFetched >= totalPages && finalItems.length >= allItems.length) || currentUrl === null
        }
    };
}

/**
 * A simpler version of aggregatePages that just returns the aggregated items array.
 * Useful when you don't need the metadata.
 *
 * @example
 * ```typescript
 * const allMembers = await aggregateItems(
 *   'https://na.finalfantasyxiv.com/lodestone/freecompany/123/member',
 *   FreeCompanyMembers,
 *   (page) => page.members
 * );
 * ```
 */
export async function aggregateItems<T extends IPagedPage, TItem>(
    initialUrl: string,
    pageClass: new () => T,
    itemExtractor: (page: T) => TItem[],
    options: PageAggregationOptions = {}
): Promise<TItem[]> {
    const result = await aggregatePages(initialUrl, pageClass, itemExtractor, options);
    return result.items;
}

export function parseAggregationParams(request: IRequest): PageAggregationOptions {
    return {
        maxPages: request.query.maxPages ? Number(request.query.maxPages) : undefined,
        maxItems: request.query.maxItems ? Number(request.query.maxItems) : undefined,
    }
}