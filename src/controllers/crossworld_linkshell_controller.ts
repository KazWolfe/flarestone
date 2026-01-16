import {loadObjectFromUrl} from "../engine";
import {CrossworldLinkshellOverview} from "../models/crossworld_linkshell/overview";
import {CrossworldLinkshellMembers} from "../models/crossworld_linkshell/members";
import {aggregatePages, parseAggregationParams} from "../transformers/page_aggregator";
import {preSerializeFilter} from "../engine/serializer";
import {buildInit} from "../utils/fetch";
import {FlarestoneRequest} from "../types/request";

export default class CrossworldLinkshellController {
    async getCrossworldLinkshell(request: FlarestoneRequest): Promise<Response> {
        const requestOpts = buildInit(request);
        const cwls = await loadObjectFromUrl(
            `https://na.finalfantasyxiv.com/lodestone/crossworld_linkshell/${request.params.id}`,
            CrossworldLinkshellOverview, requestOpts);

        return new Response(JSON.stringify(preSerializeFilter(cwls)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    /**
     * Get all members from all pages of a Cross-world Linkshell
     * This demonstrates using the aggregator to fetch all pages automatically
     *
     * Supported query parameters:
     * - maxPages: Maximum number of pages to fetch (e.g., ?maxPages=5)
     * - maxItems: Maximum number of items to return (e.g., ?maxItems=100)
     */
    async getCrossworldLinkshellMembers(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/crossworld_linkshell/${request.params.id}`;

        // Parse query parameters into aggregation options
        const options = {
            ...(parseAggregationParams(request)),
            baseUrl: 'https://na.finalfantasyxiv.com',
            delayMs: 100, // Default to 100ms to be nice to the server
            requestOpts: buildInit(request)
        };

        const result = await aggregatePages(
            url,
            CrossworldLinkshellMembers,
            (page) => page.members,
            options
        );

        const responseData: any = {
            members: preSerializeFilter(result.items),
            metadata: result.metadata
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }
}

