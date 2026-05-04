import { D1Database, ExecutionContext, KVNamespace } from '@cloudflare/workers-types';

export type EnvVars = {
    db: D1Database;
    kv_cache: KVNamespace;
    SKIP_AUTH?: string;
}

export type CloudflareParams = [EnvVars, ExecutionContext];