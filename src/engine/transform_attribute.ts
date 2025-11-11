import 'reflect-metadata';

// Special symbol for checking empty arrays or objects
export const EMPTY = Symbol('EMPTY');

// Type for conditions that can match values
export type TransformCondition = string | symbol | ((value: any) => boolean);

export type TransformOptions = {
    // Extract using a regex and return the first capture group
    extractRegex?: RegExp;

    // Extract using a regex and return a specific capture group (default is 1)
    // Can be a number for indexed groups or a string for named groups
    captureGroup?: number | string;

    // Apply a custom function transformation
    function?: (value: any, target?: any) => any;

    // Extract text field_operations from a MatchedElement
    extractText?: boolean;

    // Trim whitespace (applied after other transformers)
    trim?: boolean;

    // Parse as number (applied after other transformers)
    parseNumber?: boolean;

    // Return undefined if value matches condition (e.g., "-" for missing levels, EMPTY for empty arrays/objects, or custom function)
    undefinedIf?: TransformCondition | TransformCondition[];

    // Return null if value matches condition (e.g., EMPTY for empty arrays/objects, or custom function)
    nullIf?: TransformCondition | TransformCondition[];
}

export type TransformMetadata = {
    propertyKey: string;
    options: TransformOptions;
}

const TRANSFORM_METADATA_KEY = Symbol('transform:properties');

export function transform(options: TransformOptions) {
    return function (target: any, propertyKey: string) {
        // Get existing transformers or initialize empty array
        const existingTransforms: TransformOptions[] = Reflect.getMetadata(TRANSFORM_METADATA_KEY, target, propertyKey) || [];

        // Add this transform to the beginning
        // Since decorators apply bottom-to-top, we reverse the order during storage
        // This way they execute in the order written (top-to-bottom)
        existingTransforms.unshift(options);

        // Store updated metadata
        Reflect.defineMetadata(TRANSFORM_METADATA_KEY, existingTransforms, target, propertyKey);
    };
}

export function getTransformMetadata(target: any, propertyKey: string): TransformOptions[] {
    return Reflect.getMetadata(TRANSFORM_METADATA_KEY, target, propertyKey) || [];
}

export function applyTransform(value: any, options: TransformOptions, target?: any): any {
    if (value === null || value === undefined) {
        return value;
    }

    let result = value;

    // Extract text field_operations if requested
    if (options.extractText) {
        if (typeof value === 'object' && value.textContent !== undefined) {
            result = value.textContent;
        } else if (typeof value.getTextContent === 'function') {
            result = value.getTextContent();
        }
    }

    // Apply custom function
    if (options.function) {
        result = options.function(result, target);
    }

    // Extract using regex
    if (options.extractRegex && typeof result === 'string') {
        const match = result.match(options.extractRegex);
        if (match) {
            const captureGroup = options.captureGroup ?? 1;
            // Support both numbered and named capture groups
            if (typeof captureGroup === 'string') {
                result = match.groups?.[captureGroup] ?? null;
            } else {
                result = match[captureGroup] ?? null;
            }
        } else {
            result = null;
        }
    }

    // Check for undefined conditions
    if (options.undefinedIf) {
        const conditions = Array.isArray(options.undefinedIf) ? options.undefinedIf : [options.undefinedIf];
        for (const condition of conditions) {
            // Handle function conditions
            if (typeof condition === 'function') {
                if (condition(result)) {
                    return undefined;
                }
                continue;
            }

            // Handle EMPTY symbol
            if (condition === EMPTY) {
                // Check for empty array
                if (Array.isArray(result) && result.length === 0) {
                    return undefined;
                }
                // Check for empty object (including class instances with all undefined/null values)
                if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
                    const keys = Object.keys(result);
                    if (keys.length === 0 || keys.every(k => result[k] === undefined || result[k] === null)) {
                        return undefined;
                    }
                }
                continue;
            }

            // Handle direct value comparison
            if (condition === result) {
                return undefined;
            }
        }
    }

    // Check for null conditions
    if (options.nullIf) {
        const conditions = Array.isArray(options.nullIf) ? options.nullIf : [options.nullIf];
        for (const condition of conditions) {
            // Handle function conditions
            if (typeof condition === 'function') {
                if (condition(result)) {
                    return null;
                }
                continue;
            }

            // Handle EMPTY symbol
            if (condition === EMPTY) {
                // Check for empty array
                if (Array.isArray(result) && result.length === 0) {
                    return null;
                }
                // Check for empty object (including class instances with all undefined/null values)
                if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
                    const keys = Object.keys(result);
                    if (keys.length === 0 || keys.every(k => result[k] === undefined || result[k] === null)) {
                        return null;
                    }
                }
                continue;
            }

            // Handle direct value comparison
            if (condition === result) {
                return null;
            }
        }
    }

    // Trim whitespace
    if (options.trim && typeof result === 'string') {
        result = result.trim();
    }

    // Parse as number
    if (options.parseNumber && typeof result === 'string') {
        // Remove commas first
        const cleaned = result.replace(/,/g, '');
        result = Number(cleaned);
    }

    return result;
}

