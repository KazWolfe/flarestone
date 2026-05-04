import {CharacterPage} from "../models/character/overview";
import {preSerializeFilter} from "../engine/serializer";
import {CharacterLevelsPage} from "../models/character/levels";
import {CharacterScrapeResult, loadCharacterPageWithMeta} from "../transformers/character_scrape_meta";
import {buildInit, fsFetch} from "../utils/fetch";
import {CharacterSearchPage} from "../models/character/search";
import {loadObjectFromUrl} from "../engine";
import {FlarestoneRequest} from "../types/request";
import {EnvVars} from "../types/cloudflare";
import {cacheHeaders, getCached, putCached, shouldBypassCache} from "../cache";
import {kvCache} from "../settings";

export default class CharacterController {
    async getCharacter(request: FlarestoneRequest, env: EnvVars): Promise<Response> {
        const cacheKey = `character:overview:${request.params.id}`;

        if (!shouldBypassCache(request)) {
            const cached = await getCached(kvCache(env), cacheKey);
            if (cached) return cached;
        }

        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}`;
        const lodestoneResponse = await fsFetch(url, buildInit(request));
        const result = await loadCharacterPageWithMeta(lodestoneResponse, CharacterPage);

        const responseData = {
            ...preSerializeFilter(result.data),
            _meta: {
                ...result.scrapeMeta
            }
        };

        if (result.data?.name) {
            console.log(`Fetched information for ${result.data.name} @ ${result.data.world}.`);
        } else if (result.scrapeMeta.resultCode != CharacterScrapeResult.ERROR) {
            console.warn(`Request for character ID ${request.params.id} returned result ${result.scrapeMeta.resultCode}.`)
        } else {
            const upstreamHeaders: Record<string, string> = {};
            lodestoneResponse.headers.forEach((value, key) => { upstreamHeaders[key] = value; });
            console.error(`Request for character ID ${request.params.id} failed with an error.`, {
                lodestoneStatusCode: result.scrapeMeta.upstreamStatusCode,
                errorMessage: result.scrapeMeta.errorMessage,
                upstreamHeaders: upstreamHeaders
            });
        }

        const body = JSON.stringify(responseData);
        const TTL = 86400;

        const headers: Record<string, string> = {'Content-Type': 'application/json'};
        if (result.responseStatusCode === 200) {
            const now = Date.now();
            await putCached(kvCache(env), cacheKey, body, TTL);
            Object.assign(headers, cacheHeaders(now, TTL), {'X-Flarestone-Cache': 'MISS'});
        }

        return new Response(body, {status: result.responseStatusCode, headers});
    }

    async getCharacterLevels(request: FlarestoneRequest, env: EnvVars): Promise<Response> {
        const cacheKey = `character:levels:${request.params.id}`;

        if (!shouldBypassCache(request)) {
            const cached = await getCached(kvCache(env), cacheKey);
            if (cached) return cached;
        }

        const url = `https://na.finalfantasyxiv.com/lodestone/character/${request.params.id}/class_job/`;
        const lodestoneResponse = await fsFetch(url, buildInit(request));
        const result = await loadCharacterPageWithMeta(lodestoneResponse, CharacterLevelsPage);

        const responseData = {
            ...preSerializeFilter(result.data),
            _meta: {
                ...result.scrapeMeta
            }
        };

        const body = JSON.stringify(responseData);
        const TTL = 3600;

        const headers: Record<string, string> = {'Content-Type': 'application/json'};
        if (result.responseStatusCode === 200) {
            const now = Date.now();
            await putCached(kvCache(env), cacheKey, body, TTL);
            Object.assign(headers, cacheHeaders(now, TTL), {'X-Flarestone-Cache': 'MISS'});
        }

        return new Response(body, {status: result.responseStatusCode, headers});
    }

    async findCharacters(request: FlarestoneRequest): Promise<Response> {
        const searchParams = this.buildSearchParams(request.query);

        const url = `https://na.finalfantasyxiv.com/lodestone/character/?${searchParams}`;
        const requestInit = buildInit(request);
        const result = await loadObjectFromUrl(url, CharacterSearchPage, requestInit);

        // Filter out non-matches if using exact search
        if (request.query["exact"] === "true") {
            result.results = result.results
                .filter(r => r.name.toLowerCase() === (request.query["name"]?.toString().toLowerCase() || ""));
        }

        return new Response(JSON.stringify(preSerializeFilter(result)), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    }

    private buildSearchParams(query: { [name: string]: string | string[] | undefined }): string {
        let searchParams: URLSearchParams = new URLSearchParams();

        let name = query["name"]?.toString() || "";
        if (query["exact"] === "true") {
            name = `"${name}"`;
        }

        searchParams.set("q", name);

        if (query["world"]) {
            searchParams.set("worldname", query["world"]?.toString() || "");
        } else if (query["datacenter"]) {
            searchParams.set("worldname", `_dc_${(query["datacenter"]?.toString() || "")}`);
        } else {
            searchParams.set("worldname", "");
        }

        return searchParams.toString();
    }
}