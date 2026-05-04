import {D1Database, KVNamespace} from "@cloudflare/workers-types";
import {EnvVars} from "./types/cloudflare";

export const kvCache = (env: EnvVars): KVNamespace => env.kv_cache;
export const database = (env: EnvVars): D1Database => env.db;
export const skipAuth = (env: EnvVars): boolean => !!env.SKIP_AUTH;
