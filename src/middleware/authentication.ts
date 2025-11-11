import {IRequest} from "itty-router";
import {EnvVars} from "../cloudflare/env_vars";

export async function checkApiKey(request: IRequest, env: EnvVars) {
    const expectedKeys = env.API_KEYS?.split(",").map(k => k.trim()) || [];

    if (expectedKeys.length == 0) {
        // If no API keys, just pass things through.
        return undefined;
    }

    const providedKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key') || null;

    if (!providedKey || !expectedKeys.includes(providedKey)) {
        return new Response('Unauthorized', {status: 401});
    }
}