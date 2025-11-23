import {IRequest} from "itty-router";
import {EnvVars} from "../types/cloudflare";
import {FlarestoneRequest} from "../types/request";

export async function authenticate(request: FlarestoneRequest, env: EnvVars) {
    let apiKeys: Record<string, { identifier?: string }> = {};

    try {
        apiKeys = JSON.parse(env.API_KEYS);
    } catch (SyntaxError) {
        const keys = env.API_KEYS?.split(",").map(k => k.trim()) || [];

        for (const key of keys) {
            apiKeys[key] = {
                identifier: undefined,
            };
        }
    }

    if (Object.keys(apiKeys).length == 0) {
        // If no API keys, just pass things through.
        return undefined;
    }

    const providedKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key') || null;

    if (!providedKey || !apiKeys.hasOwnProperty(providedKey)) {
        return new Response('Unauthorized', {status: 401});
    }

    request.user = {
        apiKey: providedKey,
        clientIdentifier: apiKeys[providedKey].identifier || "Flarestone-API",
    };
}