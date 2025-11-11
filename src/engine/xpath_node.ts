/**
 * Type alias for XPath results that represent DOM elements.
 * Use this type when you want the actual DOM element returned by the XPath query,
 * rather than its text field_operations or a parsed value.
 *
 * This allows you to access Element methods like getAttribute(), innerHTML, etc.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @xpath(".//div[@class='field_operations']")
 *   field_operations!: XPathNode;
 *
 *   get text(): string {
 *     return this.field_operations.textContent || '';
 *   }
 *
 *   get className(): string {
 *     return this.field_operations.getAttribute('class') || '';
 *   }
 * }
 * ```
 */
export type MatchedElement = Element;

