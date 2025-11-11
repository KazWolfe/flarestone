import { DOMParser } from '@xmldom/xmldom';
import * as xpath from 'xpath';
import { getXPathMetadata, XPathMetadata } from './xpath_attribute';
import { getTransformMetadata, applyTransform } from './transform_attribute';
import * as htmlparser2 from 'htmlparser2';
import type { ChildNode } from 'domhandler';

/**
 * Parse HTML string to a DOM Document
 * Uses htmlparser2 first to parse the HTML, then converts to xmldom for XPath support
 */
export function parseHtmlToDom(html: string): Document {
    // First, parse with htmlparser2 to handle HTML better
    const handler = new htmlparser2.DomHandler();
    const parser = new htmlparser2.Parser(handler, {
        lowerCaseTags: false,
        lowerCaseAttributeNames: false,
        decodeEntities: true,
        // Ensure we parse script and style field_operations as text
        recognizeSelfClosing: true
    });
    parser.write(html);
    parser.end();

    // Convert htmlparser2 DOM to XML string
    const root: any = handler.root;
    const xmlString = domToXmlString(root.children || [root]);

    // Now parse with xmldom for XPath support
    const domParser = new DOMParser({
        errorHandler: {
            warning: () => {},
            error: () => {},
            fatalError: (err) => { throw new Error(err); }
        }
    });

    return domParser.parseFromString(xmlString, 'text/xml');
}

/**
 * Convert htmlparser2 DOM to XML string
 */
function domToXmlString(nodes: ChildNode[]): string {
    let result = '';
    const voidElements = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

    for (const node of nodes) {
        // Handle tag, script, and style elements (htmlparser2 treats script/style as separate types)
        if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
            const elem = node as any;
            const tagName = elem.name.toLowerCase();
            result += `<${elem.name}`;

            // Add attributes
            if (elem.attribs) {
                for (const [key, value] of Object.entries(elem.attribs)) {
                    const escaped = String(value)
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    result += ` ${key}="${escaped}"`;
                }
            }

            // Handle void/self-closing HTML elements
            if (voidElements.has(tagName)) {
                // For void elements, just close the tag (HTML style, not XML style)
                result += '>';
            } else if (!elem.children || elem.children.length === 0) {
                // For empty non-void elements, use proper closing tag
                result += `></${elem.name}>`;
            } else {
                result += '>';
                result += domToXmlString(elem.children);
                result += `</${elem.name}>`;
            }
        } else if (node.type === 'text') {
            const textNode = node as any;
            result += textNode.data
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } else if (node.type === 'comment') {
            // Skip comments
        } else if (node.type === 'directive') {
            // Skip directives
        } else if (node.type === 'cdata') {
            const cdataNode = node as any;
            result += `<![CDATA[${cdataNode.data}]]>`;
        }
    }

    return result;
}

/**
 * Check if a type is a Node-like type (should return raw DOM node)
 */
function isNodeType(targetType: Function | undefined): boolean {
    if (!targetType) return false;
    const typeName = targetType.name;
    // Check for Node, Element, or any DOM node types
    // Also check for our XPathNode marker type
    return typeName === 'Node' ||
           typeName === 'Element' ||
           typeName === 'Document' ||
           typeName === 'XPathNode' ||
           typeName === 'Object'; // design:type emits Object for interfaces.ts
}

/**
 * Get the inner HTML/XML field_operations of a node (similar to innerHTML)
 * This serializes all child nodes to a string, preserving HTML structure
 */
export function getInnerHTML(node: any): string {
    if (!node || !node.childNodes) return '';
    const voidElements = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

    let result = '';
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];

        if (child.nodeType === 1) { // ELEMENT_NODE
            const tagName = child.nodeName.toLowerCase();
            result += `<${tagName}`;

            // Add attributes
            if (child.attributes) {
                for (let j = 0; j < child.attributes.length; j++) {
                    const attr = child.attributes[j];
                    result += ` ${attr.name}="${attr.value}"`;
                }
            }

            // Handle void elements (HTML style)
            if (voidElements.has(tagName)) {
                result += '>';
            } else if (child.childNodes && child.childNodes.length > 0) {
                result += '>';
                result += getInnerHTML(child);
                result += `</${tagName}>`;
            } else {
                result += `></${tagName}>`;
            }
        } else if (child.nodeType === 3) { // TEXT_NODE
            result += child.nodeValue || '';
        } else if (child.nodeType === 4) { // CDATA_SECTION_NODE
            result += `<![CDATA[${child.nodeValue || ''}]]>`;
        } else if (child.nodeType === 8) { // COMMENT_NODE
            result += `<!--${child.nodeValue || ''}-->`;
        }
    }

    return result;
}

/**
 * Get text field_operations from an element node
 */
export function getTextContent(node: any): string {
    if (node.textContent !== undefined) {
        return node.textContent.trim();
    }

    // Fallback: manually collect text from child nodes
    let text = '';
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 3) { // TEXT_NODE
                text += child.nodeValue || '';
            } else if (child.nodeType === 1) { // ELEMENT_NODE
                text += getTextContent(child);
            }
        }
    }
    return text.trim();
}

/**
 * Coerce a value to a target type
 */
function coerceToType(value: any, targetType: Function | undefined): any {
    if (!targetType || targetType === String) {
        return String(value);
    }

    if (targetType === Number) {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    if (targetType === Boolean) {
        return Boolean(value);
    }

    return value;
}

/**
 * Check if an object/node is empty
 */
function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;

    // Check if it's a node with no meaningful field_operations
    if (value.nodeType === 1) { // ELEMENT_NODE
        const text = getTextContent(value);
        // Empty element nodes with no children
        if (text === '' && (!value.childNodes || value.childNodes.length === 0)) {
            return true;
        }
        return text === '';
    }

    // Check if it's an object with all undefined/null properties
    if (typeof value === 'object' && !Array.isArray(value)) {
        const keys = Object.keys(value);
        if (keys.length === 0) return true;

        // Check if all non-underscore properties are undefined or null
        const nonInternalKeys = keys.filter(k => !k.startsWith('_'));
        if (nonInternalKeys.length === 0) return true;

        return nonInternalKeys.every(k => value[k] === undefined || value[k] === null);
    }

    return false;
}

/**
 * Extract the value from an XPath result and convert it to the appropriate type
 */
function extractValue(node: any, targetType: Function | undefined, metadata: XPathMetadata): any {
    if (!node) {
        if (metadata.options.default !== undefined) {
            return metadata.options.default;
        }
        return undefined;
    }

    // Handle Node types
    if (node.nodeType !== undefined) {
        // Text node
        if (node.nodeType === 3) { // TEXT_NODE
            const text = node.nodeValue?.trim() || '';
            return coerceToType(text, targetType);
        }

        // Attribute node
        if (node.nodeType === 2) { // ATTRIBUTE_NODE
            const attrValue = node.nodeValue || '';
            return coerceToType(attrValue, targetType);
        }

        // Element node
        if (node.nodeType === 1) { // ELEMENT_NODE
            // If target type is a class with XPath metadata, check if node is empty first
            if (targetType && getXPathMetadata(targetType).length > 0) {
                // Check if element is empty (no children) and we have defaultIfEmpty
                if (metadata.options.defaultIfEmpty && (!node.childNodes || node.childNodes.length === 0)) {
                    return metadata.options.default !== undefined ? metadata.options.default : null;
                }

                const result = injectInto(node, targetType as new () => any);

                // If defaultIfEmpty is set and the resulting object is empty, return default
                if (metadata.options.defaultIfEmpty && isEmpty(result)) {
                    return metadata.options.default !== undefined ? metadata.options.default : null;
                }

                return result;
            }

            // If target type is Node/Element/XPathNode, return the raw node
            if (isNodeType(targetType)) {
                return node;
            }

            // For string types, return innerHTML to preserve HTML structure
            // For other types, return text field_operations
            if (!targetType || targetType === String) {
                return getInnerHTML(node);
            } else {
                const textContent = getTextContent(node);
                return coerceToType(textContent, targetType);
            }
        }

        // Document node
        if (node.nodeType === 9) { // DOCUMENT_NODE
            if (targetType && getXPathMetadata(targetType).length > 0) {
                return injectInto(node, targetType as new () => any);
            }
            return node;
        }
    }

    // Handle primitive results (string, number, boolean)
    return coerceToType(node, targetType);
}

/**
 * Inject XPath values into a class instance
 */
export function  injectInto<T>(contextNode: Node | Document, targetClass: new () => T): T {
    const instance = new targetClass();
    const metadata = getXPathMetadata(targetClass);

    // Get design:type metadata for type inference
    const designTypes = new Map<string, Function>();
    for (const meta of metadata) {
        const designType = Reflect.getMetadata('design:type', targetClass.prototype, meta.propertyKey);
        if (designType) {
            designTypes.set(meta.propertyKey, designType);
        }
    }

    for (const meta of metadata) {
        try {
            // Determine target type
            let targetType: Function | undefined = undefined;
            if (meta.options.type) {
                targetType = meta.options.type();
            } else if (designTypes.has(meta.propertyKey)) {
                targetType = designTypes.get(meta.propertyKey);
            }

            // Execute XPath query
            const result = xpath.select(meta.selector, contextNode);

            // Handle array results (many: true)
            if (meta.options.many) {
                const nodes = Array.isArray(result) ? result : [result];
                (instance as any)[meta.propertyKey] = nodes
                    .filter(node => node !== null && node !== undefined)
                    .map(node => extractValue(node, targetType, meta));
            } else {
                // Handle single result
                const node = Array.isArray(result) ? result[0] : result;
                const value = extractValue(node, targetType, meta);

                // Check if we should use default for empty values
                if (meta.options.defaultIfEmpty && isEmpty(value)) {
                    (instance as any)[meta.propertyKey] = meta.options.default;
                } else {
                    (instance as any)[meta.propertyKey] = value;
                }
            }
        } catch (error) {
            console.error(`Error processing XPath for property '${meta.propertyKey}':`, error);
            if (meta.options.default !== undefined) {
                (instance as any)[meta.propertyKey] = meta.options.default;
            }
        }
    }

    // Apply transformers to properties that have them
    for (const meta of metadata) {
        const transforms = getTransformMetadata(targetClass.prototype, meta.propertyKey);
        if (transforms.length > 0) {
            try {
                let currentValue = (instance as any)[meta.propertyKey];
                // Apply each transform in sequence
                for (const transformOptions of transforms) {
                    currentValue = applyTransform(currentValue, transformOptions, instance);
                }
                (instance as any)[meta.propertyKey] = currentValue;
            } catch (error) {
                console.error(`Error applying transforms for property '${meta.propertyKey}':`, error);
            }
        }
    }

    return instance;
}

