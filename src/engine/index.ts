import 'reflect-metadata';
import { parseHtmlToDom, injectInto } from './injector';
import {fsFetch} from "../utils/fetch";

export { transform, EMPTY } from './transform_attribute';
export type { TransformOptions } from './transform_attribute';

/**
 * Load an object from a URL by fetching HTML and parsing it
 */
export async function loadObjectFromUrl<T>(url: string, targetClass: new () => T, requestOpts?: RequestInit | undefined): Promise<T> {
    const res = await fsFetch(url, requestOpts);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const html = await res.text();

    const doc = parseHtmlToDom(html);
    return injectInto(doc, targetClass);
}

/**
 * Load an object from a file path (Node.js only)
 */
export async function loadObjectFromFile<T>(path: string, targetClass: new () => T): Promise<T> {
    const fs = await import('fs/promises');
    const html = await fs.readFile(path, { encoding: 'utf8' });

    const doc = parseHtmlToDom(html);
    return injectInto(doc, targetClass);
}

/**
 * Load an object from an HTML string
 */
export function loadObjectFromString<T>(html: string, targetClass: new () => T): T {
    const doc = parseHtmlToDom(html);
    return injectInto(doc, targetClass);
}

/**
 * Alias for loadObjectFromString for convenience
 */
export function deserialize<T>(targetClass: new () => T, html: string): T {
    return loadObjectFromString(html, targetClass);
}

