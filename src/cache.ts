import {KVNamespace} from "@cloudflare/workers-types";
import {FlarestoneRequest} from "./types/request";

type CacheMeta = {
    cachedAt: number;
    ttl: number;
};

export function shouldBypassCache(request: FlarestoneRequest): boolean {
    return request.query?.['fresh'] === 'true' && (request.user?.cacheBypass === true);
}

export function cacheHeaders(cachedAt: number, ttl: number): Record<string, string> {
    const expiresAt = new Date(cachedAt + ttl * 1000);
    const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    return {
        'Last-Modified': new Date(cachedAt).toUTCString(),
        'Expires': expiresAt.toUTCString(),
        'Cache-Control': `max-age=${maxAge}`,
    };
}

export async function getCached(kv: KVNamespace, key: string): Promise<Response | null> {
    const {value, metadata} = await kv.getWithMetadata<CacheMeta>(key, 'text');
    if (!value || !metadata) return null;

    return new Response(value, {
        headers: {
            'Content-Type': 'application/json',
            ...cacheHeaders(metadata.cachedAt, metadata.ttl),
            'X-Flarestone-Cache': 'HIT',
        },
    });
}

export async function putCached(kv: KVNamespace, key: string, body: string, ttl: number): Promise<void> {
    await kv.put(key, body, {
        expirationTtl: ttl,
        metadata: {cachedAt: Date.now(), ttl} satisfies CacheMeta,
    });
}
