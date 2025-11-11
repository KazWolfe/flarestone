import {getInnerHTML} from "./injector";
import "reflect-metadata";

const SERIALIZER_METADATA_KEY = Symbol('serializer:property');

export interface SerializerPropertyOptions {
    internal?: boolean;
    emplaceAfter?: string;
    key?: string;
}

/**
 * Decorator to control serialization behavior of properties and getters
 */
export function serializerProperty(options: SerializerPropertyOptions = {}) {
    return function (target: any, propertyKey: string) {
        Reflect.defineMetadata(SERIALIZER_METADATA_KEY, options, target, propertyKey);
    };
}

/**
 * Serialize an object for JSON output, handling special cases like DOM nodes
 */
export function preSerializeFilter(obj: any): any {
    const seen = new WeakSet();

    function inner(o: any): any {
        // Handle primitives
        if (o === null || o === undefined) return o;
        if (typeof o !== 'object') return o;

        // Handle DOM nodes - convert to string representation
        if (o && (o.nodeType !== undefined)) {
            // For Element nodes, return innerHTML or textContent
            if (o.nodeType === 1) { // ELEMENT_NODE
                return getInnerHTML(o) || o.textContent || o.toString();
            }
            return o.toString();
        }

        // If object has toJSON, use it
        if (typeof o.toJSON === 'function') {
            return o.toJSON();
        }

        // Avoid circular references
        if (seen.has(o)) return undefined;
        seen.add(o);

        // Use Map to preserve insertion order
        const outMap = new Map<string, any>();

        // For arrays, just process each element
        if (Array.isArray(o)) {
            return o.map(item => inner(item));
        }

        // Collect getters from prototype with their metadata
        const getters = new Map<string, {value: any, emplaceAfter?: string}>();
        const proto = Object.getPrototypeOf(o);
        if (proto && proto !== Object.prototype) {
            const names = Object.getOwnPropertyNames(proto);
            for (const n of names) {
                if (n === 'constructor') continue;
                const desc = Object.getOwnPropertyDescriptor(proto, n);
                if (desc && typeof desc.get === 'function') {
                    // Check for @serializerProperty metadata
                    const serializerMeta: SerializerPropertyOptions | undefined =
                        Reflect.getMetadata(SERIALIZER_METADATA_KEY, proto, n);

                    // Skip if marked as private
                    if (serializerMeta?.internal === true) continue;

                    // Skip private getters (TypeScript emits private metadata)
                    const metadata = Reflect.getMetadata?.('design:private', proto, n);
                    if (metadata === true) continue;

                    // Skip underscore-prefixed getters
                    if (n.startsWith('_')) continue;

                    try {
                        const val = o[n];
                        const keyName = serializerMeta?.key || n;
                        getters.set(keyName, {
                            value: inner(val),
                            emplaceAfter: serializerMeta?.emplaceAfter
                        });
                    } catch (err) {
                        // Skip getters that throw
                    }
                }
            }
        }

        // Copy own properties (including underscore-prefixed ones for now)
        for (const k of Object.keys(o)) {
            // Check for @serializerProperty metadata on properties
            const propMeta: SerializerPropertyOptions | undefined =
                Reflect.getMetadata(SERIALIZER_METADATA_KEY, o, k);

            // Skip if property is marked as private
            if (propMeta?.internal === true) continue;

            // Determine the key name to use in output
            const keyName = propMeta?.key || k;

            // Check if this is a non-underscore property that has a getter
            if (!k.startsWith('_') && getters.has(keyName)) {
                // Use the getter value instead of the property
                const getterInfo = getters.get(keyName)!;
                outMap.set(keyName, getterInfo.value);
                getters.delete(keyName);
            } else {
                outMap.set(keyName, inner(o[k]));

                // If this is an underscore-prefixed property, check if there's a corresponding getter
                if (k.startsWith('_')) {
                    const publicName = k.substring(1);
                    if (getters.has(publicName)) {
                        // Insert the getter right after the private property
                        const getterInfo = getters.get(publicName)!;
                        outMap.set(publicName, getterInfo.value);
                        getters.delete(publicName);
                    }
                }

                // Check if any getters want to be emplaced after this property
                for (const [getterName, getterInfo] of getters) {
                    if (getterInfo.emplaceAfter === keyName) {
                        outMap.set(getterName, getterInfo.value);
                        getters.delete(getterName);
                    }
                }
            }
        }

        // Add any remaining getters that didn't have a corresponding property
        for (const [name, getterInfo] of getters) {
            if (!outMap.has(name)) {
                outMap.set(name, getterInfo.value);
            }
        }

        // Convert Map to plain object, filtering out underscore-prefixed keys
        const out: any = {};
        for (const [k, v] of outMap) {
            if (!k.startsWith('_')) {
                out[k] = v;
            }
        }

        return out;
    }

    return inner(obj);
}

export function toKeyString(input: string) {
    return input.trim().toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_{2,}/g, '_');
}