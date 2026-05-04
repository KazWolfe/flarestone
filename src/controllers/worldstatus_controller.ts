import {preSerializeFilter} from "../engine/serializer";
import {buildInit} from "../utils/fetch";
import {loadObjectFromUrl} from "../engine";
import {FlarestoneRequest} from "../types/request";
import {WorldStatusPage} from "../models/worldstatus";
import {flattenWorldStatus} from "../transformers/worldstatus_flattener";
import {EnvVars} from "../types/cloudflare";
import {cacheHeaders, putCached, shouldBypassCache} from "../cache";
import {kvCache} from "../settings";

const CACHE_KEY = 'worldstatus';
const CACHE_TTL = 300;

type WorldStatusResult = {
    data: ReturnType<typeof preSerializeFilter>;
    cachedAt: number;
    ttl: number;
    cacheHit: boolean;
};

export default class WorldStatusController {
    private async fetchWorldStatus(request: FlarestoneRequest, env: EnvVars): Promise<WorldStatusResult> {
        if (!shouldBypassCache(request)) {
            const {value, metadata} = await kvCache(env).getWithMetadata<{cachedAt: number, ttl: number}>(CACHE_KEY, 'text');
            if (value && metadata) {
                return {data: JSON.parse(value), cachedAt: metadata.cachedAt, ttl: metadata.ttl, cacheHit: true};
            }
        }

        const status = await loadObjectFromUrl(
            `https://na.finalfantasyxiv.com/lodestone/worldstatus/`,
            WorldStatusPage,
            buildInit(request)
        );
        const data = preSerializeFilter(status);

        const now = Date.now();
        await putCached(kvCache(env), CACHE_KEY, JSON.stringify(data), CACHE_TTL);

        return {data, cachedAt: now, ttl: CACHE_TTL, cacheHit: false};
    }

    private buildHeaders(cachedAt: number, ttl: number, cacheHit: boolean): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...cacheHeaders(cachedAt, ttl),
        };
        headers['X-Flarestone-Cache'] = cacheHit ? 'HIT' : 'MISS';
        return headers;
    }

    async getWorldStatus(request: FlarestoneRequest, env: EnvVars): Promise<Response> {
        const {data, cachedAt, ttl, cacheHit} = await this.fetchWorldStatus(request, env);
        return new Response(JSON.stringify(data), {headers: this.buildHeaders(cachedAt, ttl, cacheHit)});
    }

    async getWorldStatusFlat(request: FlarestoneRequest, env: EnvVars): Promise<Response> {
        const {data, cachedAt, ttl, cacheHit} = await this.fetchWorldStatus(request, env);
        const flat = flattenWorldStatus(Object.values(data.regions));
        return new Response(JSON.stringify(flat), {headers: this.buildHeaders(cachedAt, ttl, cacheHit)});
    }
}
