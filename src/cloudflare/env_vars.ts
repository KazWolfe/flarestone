import { ExecutionContext } from '@cloudflare/workers-types';

export type EnvVars = {
    API_KEYS: string;
}

export type CloudflareParams = [EnvVars, ExecutionContext];