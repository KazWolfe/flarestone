import {EnvVars} from "../types/cloudflare";
import {FlarestoneRequest} from "../types/request";
import {database, skipAuth} from "../settings";

type ApiKeyRow = {
    key: string;
    name: string;
    cache_bypass: number;
    admin: number;
};

export async function authenticate(request: FlarestoneRequest, env: EnvVars) {
    if (skipAuth(env)) {
        request.user = {
            apiKey: 'skip_auth',
            clientIdentifier: 'Flarestone-SkipAuth',
            cacheBypass: true,
            admin: false,
        };
        return;
    }

    const providedKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key') || null;

    if (!providedKey) {
        return new Response('Unauthorized', {status: 401});
    }

    const row = await database(env)
        .prepare('SELECT key, name, cache_bypass, admin FROM api_keys WHERE key = ? AND enabled = 1')
        .bind(providedKey)
        .first<ApiKeyRow>();

    if (!row) {
        return new Response('Unauthorized', {status: 401});
    }

    request.user = {
        apiKey: row.key,
        clientIdentifier: row.name,
        cacheBypass: row.cache_bypass === 1,
        admin: row.admin === 1,
    };
}
