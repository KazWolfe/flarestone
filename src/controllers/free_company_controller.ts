import {loadObjectFromUrl} from "../engine";
import {FreeCompany} from "../models/free_company/overview";
import {FreeCompanyMembers} from "../models/free_company/members";
import {aggregatePages, parseAggregationParams} from "../transformers/page_aggregator";
import {findFreeCompanyRanks, extractRanksFromPages} from "../transformers/fc_rank_extractor";
import {preSerializeFilter} from "../engine/serializer";
import {buildInit} from "../utils/fetch";
import {FlarestoneRequest} from "../types/request";

export default class FreeCompanyController {
    async getFreeCompany(request: FlarestoneRequest): Promise<Response> {
        const requestOpts = buildInit(request);
        const chara = await loadObjectFromUrl(
            `https://na.finalfantasyxiv.com/lodestone/freecompany/${request.params.id}`,
            FreeCompany, requestOpts);

        return new Response(JSON.stringify(preSerializeFilter(chara)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    /**
     * Get all members from all pages of a Free Company
     * This demonstrates using the aggregator to fetch all pages automatically
     *
     * Supported query parameters:
     * - maxPages: Maximum number of pages to fetch (e.g., ?maxPages=5)
     * - maxItems: Maximum number of items to return (e.g., ?maxItems=100)
     */
    async getFreeCompanyMembers(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/freecompany/${request.params.id}/member`;

        // Parse query parameters into aggregation options
        const options = {
            ...(parseAggregationParams(request)),
            baseUrl: 'https://na.finalfantasyxiv.com',
            delayMs: 100, // Default to 100ms to be nice to the server
            requestOpts: buildInit(request)
        };

        const result = await aggregatePages(
            url,
            FreeCompanyMembers,
            (page) => page.members,
            options
        );

        const responseData: any = {
            members: preSerializeFilter(result.items),
        };

        // Only return rank information if this was a complete fetch.
        if (result.metadata.complete) {
            responseData.ranks = extractRanksFromPages(result.pages);
        }

        responseData.metadata = result.metadata;

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    /**
     * Get all unique ranks from a Free Company using efficient binary search
     * This minimizes requests by intelligently searching for rank boundaries
     *
     * Supported query parameters:
     * - delayMs: Delay between requests in milliseconds (e.g., ?delayMs=200)
     */
    async getFreeCompanyRanks(request: FlarestoneRequest): Promise<Response> {
        const result = await findFreeCompanyRanks(request.params.id, {
            baseUrl: 'https://na.finalfantasyxiv.com',
            delayMs: 100,
            requestOpts: buildInit(request)
        });

        return new Response(JSON.stringify({
            ranks: result.ranks,
            metadata: result.metadata
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}