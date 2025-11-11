import 'reflect-metadata';

export type XPathOptions = {
    // Allows overriding type generating for Arrays or if we're using | null
    type?: () => Function;

    // The default value if a match isn't found.
    default?: any;

    // If true, consider an object with no children to be invalid and return "default" instead.
    defaultIfEmpty?: boolean;

    // If true, return an array of all matching nodes
    many?: boolean;
}

export type XPathMetadata = {
    propertyKey: string;
    selector: string;
    options: XPathOptions;
}

const XPATH_METADATA_KEY = Symbol('xpath:properties');

export function xpath(selector: string, options: XPathOptions = {}) {
    return function (target: any, propertyKey: string) {
        // Get existing metadata or initialize
        // IMPORTANT: Create a new array to avoid mutating parent class metadata
        const existingMetadata: XPathMetadata[] = Reflect.getMetadata(XPATH_METADATA_KEY, target.constructor) || [];
        const newMetadata = [...existingMetadata];

        // Add this property's metadata
        newMetadata.push({
            propertyKey,
            selector,
            options
        });

        // Store updated metadata
        Reflect.defineMetadata(XPATH_METADATA_KEY, newMetadata, target.constructor);
    };
}

export function getXPathMetadata(target: Function): XPathMetadata[] {
    // Collect metadata from the entire prototype chain
    const allMetadata: XPathMetadata[] = [];
    const seen = new Set<string>();

    let currentTarget: Function | null = target;
    while (currentTarget && currentTarget !== Object) {
        // Get only the metadata defined directly on this class
        const ownMetadata: XPathMetadata[] = Reflect.getOwnMetadata(XPATH_METADATA_KEY, currentTarget) || [];

        // Add metadata that we haven't seen yet (child classes override parent properties)
        for (const meta of ownMetadata) {
            if (!seen.has(meta.propertyKey)) {
                allMetadata.push(meta);
                seen.add(meta.propertyKey);
            }
        }

        // Move up the prototype chain
        currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return allMetadata;
}