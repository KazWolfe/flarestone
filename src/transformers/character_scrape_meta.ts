/**
 * Character-specific availability detection transformer.
 * Detects when a character page exists but has limited or no data available.
 */
import {loadObjectFromString} from "../engine";

export enum CharacterScrapeResult {
    /** Character profile is fully available */
    SUCCESS = 'success',

    /** Character exists but profile is set to private */
    PROFILE_PRIVATE = 'profile_private',

    /** Character page returned 403 Forbidden */
    CHARACTER_HIDDEN = 'character_hidden',

    /** Character page returned 404 Not Found */
    NOT_FOUND = 'not_found',

    /** Lodestone was under active maintenance during the last update. */
    LODESTONE_MAINTENANCE = 'maintenance',

    /** Other error occurred */
    ERROR = 'error'
}

export interface CharacterScrapeMeta {
    resultCode: CharacterScrapeResult;
    upstreamStatusCode?: number;
}

/**
 * Result type for character page loading with availability detection.
 */
export interface CharacterPageResult<T> {
    data: T | null;
    scrapeMeta: CharacterScrapeMeta;

    responseStatusCode: number;
}

/**
 * Detects character availability from HTML content and HTTP status.
 */
export function detectCharacterAvailability(html: string, statusCode: number): CharacterScrapeMeta {
    // Check HTTP errors first
    if (statusCode === 403) {
        return {resultCode: CharacterScrapeResult.CHARACTER_HIDDEN, upstreamStatusCode: statusCode};
    }
    if (statusCode === 404) {
        return {resultCode: CharacterScrapeResult.NOT_FOUND, upstreamStatusCode: statusCode};
    }
    if ((statusCode === 502 || statusCode === 503) && html.includes("The Lodestone is currently down for maintenance")) {
        return {resultCode: CharacterScrapeResult.LODESTONE_MAINTENANCE, upstreamStatusCode: statusCode};
    }
    if (statusCode >= 400) {
        return {resultCode: CharacterScrapeResult.ERROR, upstreamStatusCode: statusCode};
    }

    // Check for private profile message
    // FIXME: A player can put this in their profile description to spoof this detection. Fix that.
    if (statusCode === 200 && html.includes("This character's profile is private")) {
        return {resultCode: CharacterScrapeResult.PROFILE_PRIVATE, upstreamStatusCode: statusCode};
    }

    // Default to available
    return {resultCode: CharacterScrapeResult.SUCCESS, upstreamStatusCode: statusCode};
}

/**
 * Maps CharacterAvailability to appropriate HTTP status codes for responses.
 */
function getStatusCodeForAvailability(availability: CharacterScrapeResult, originalStatus?: number): number {
    switch (availability) {
        case CharacterScrapeResult.SUCCESS:
        case CharacterScrapeResult.PROFILE_PRIVATE:
            return 200;
        case CharacterScrapeResult.CHARACTER_HIDDEN:
            return 403;
        case CharacterScrapeResult.NOT_FOUND:
            return 404;
        case CharacterScrapeResult.ERROR:
            return originalStatus && originalStatus >= 400 ? originalStatus : 500;
        case CharacterScrapeResult.LODESTONE_MAINTENANCE:
            return 503;
        default:
            return 200;
    }
}

/**
 * Load a character page from a URL with availability detection.
 * Wraps the standard loadObjectFromUrl but adds character-specific availability detection.
 *
 * @param response - The HTTP response for a fetch.
 * @param targetClass - The class to instantiate and populate with parsed data
 * @returns An object containing the parsed data (if available) and availability info
 */
export async function loadCharacterPageWithMeta<T>(
    response: Response, targetClass: new () => T
): Promise<CharacterPageResult<T>> {

    // Fetch and get HTML to check availability
    const html = await response.text();
    const availabilityInfo = detectCharacterAvailability(html, response.status);

    // Parse the data (works even for private profiles which still have some data)
    let data: T | null = loadObjectFromString(html, targetClass);

    return {
        data,
        scrapeMeta: availabilityInfo,
        responseStatusCode: getStatusCodeForAvailability(availabilityInfo.resultCode, availabilityInfo.upstreamStatusCode)
    };
}
