import {LinkshellOverview} from "../models/linkshell/overview";
import {LinkshellMembers} from "../models/linkshell/members";
import {aggregatePages, parseAggregationParams} from "../transformers/page_aggregator";
import {preSerializeFilter} from "../engine/serializer";
import {buildInit} from "../utils/fetch";
import {fsFetch} from "../utils/fetch";
import {FlarestoneRequest} from "../types/request";
import {parseHtmlToDom, injectInto} from "../engine/injector";

export default class LinkshellController {
    async getLinkshell(request: FlarestoneRequest): Promise<Response> {
        const requestOpts = buildInit(request);
        const url = `https://na.finalfantasyxiv.com/lodestone/linkshell/${request.params.id}`;
        const fetchAllMembers = 'all_members' in request.query;

        // Fetch HTML once
        const response = await fsFetch(url, requestOpts);
        const html = await response.text();
        const dom = parseHtmlToDom(html);

        // Parse overview
        const linkshell = injectInto(dom, LinkshellOverview);
        const responseData: any = preSerializeFilter(linkshell);

        // Always include page 1 members
        const membersPage = injectInto(dom, LinkshellMembers);
        const totalPages = membersPage.getTotalPages();
        const items = [...membersPage.members];
        let membersFetchMeta: {} = {
            totalPages,
            pagesFetched: 1,
            complete: totalPages === 1
        };

        // Fetch all pages if requested
        if (fetchAllMembers && totalPages > 1) {
            const nextPageUrl = membersPage.getNextPageUrl();
            const options = {
                ...(parseAggregationParams(request)),
                baseUrl: 'https://na.finalfantasyxiv.com',
                delayMs: 100,
                requestOpts: buildInit(request),
                skippedPages: 1  // starting on page 2
            };

            const result = await aggregatePages(
                nextPageUrl!,
                LinkshellMembers,
                (page) => page.members,
                options
            );

            items.push(...result.items);
            membersFetchMeta = result.metadata;
        }

        responseData.members = preSerializeFilter(items);
        responseData.membersMetadata = membersFetchMeta;

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    /**
     * Get all members from all pages of a Linkshell
     * This demonstrates using the aggregator to fetch all pages automatically
     *
     * Supported query parameters:
     * - maxPages: Maximum number of pages to fetch (e.g., ?maxPages=5)
     * - maxItems: Maximum number of items to return (e.g., ?maxItems=100)
     */
    async getLinkshellMembers(request: FlarestoneRequest): Promise<Response> {
        const url = `https://na.finalfantasyxiv.com/lodestone/linkshell/${request.params.id}`;

        // Parse query parameters into aggregation options
        const options = {
            ...(parseAggregationParams(request)),
            baseUrl: 'https://na.finalfantasyxiv.com',
            delayMs: 100, // Default to 100ms to be nice to the server
            requestOpts: buildInit(request)
        };

        const result = await aggregatePages(
            url,
            LinkshellMembers,
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

