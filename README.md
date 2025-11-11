# Flarestone XPath

A TypeScript decorator-based XPath data extraction library designed for Cloudflare Workers and Node.js environments. Parse HTML documents and extract structured data using declarative `@xpath` decorators.

## Features

- 🎯 **Declarative XPath Queries**: Use decorators to map XPath selectors to class properties
- 🔄 **Nested Object Support**: Automatically resolve complex objects with their own XPath decorators
- 📦 **Type-Safe**: Full TypeScript support with type inference
- 🌐 **Cloudflare Workers Compatible**: No JSDom dependency - uses xmldom and xpath libraries
- 🎨 **Flexible**: Support for strings, numbers, arrays, and raw DOM nodes
- 🔧 **HTML Preservation**: Maintains original HTML structure (e.g., `<br>` stays as `<br>`, not `<br/>`)
- 📄 **Pagination Aggregation**: Automatically fetch and combine results from multi-page views

## Installation

```bash
npm install @kazwolfe/flarestone
```

Dependencies:
- `@xmldom/xmldom` - XML/HTML parsing
- `xpath` - XPath query execution
- `reflect-metadata` - Decorator metadata support
- `htmlparser2` - HTML parsing assistance

## Quick Start

```typescript
import { xpath, loadObjectFromUrl, serializeForJson } from '@kazwolfe/flarestone';

class Character {
    @xpath("//h1[@class='name']/text()")
    name!: string;

    @xpath("//span[@class='level']/text()")
    level!: number;

    @xpath("//ul[@class='items']/li", { many: true })
    items!: string[];
}

// Load from URL
const character = await loadObjectFromUrl('https://example.com/character', Character);

// Serialize to JSON (removes internal properties and DOM nodes)
const json = serializeForJson(character);
console.log(json);
```

## Core Concepts

### Basic Usage

The `@xpath` decorator maps XPath selectors to class properties:

```typescript
class Profile {
    // Extract text field_operations
    @xpath("//div[@class='bio']/text()")
    bio!: string;

    // Extract attribute value
    @xpath("//img[@class='avatar']/@src")
    avatarUrl!: string;

    // Extract and convert to number
    @xpath("//span[@class='score']/text()")
    score!: number;
}
```

### Arrays (`many: true`)

Use the `many` option to collect multiple matches:

```typescript
class JobLevels {
    @xpath("//ul[@class='jobs']/li", { many: true, type: () => Job })
    jobs!: Job[];
}

class Job {
    @xpath(".//span[@class='name']/text()")
    name!: string;

    @xpath(".//span[@class='level']/text()")
    level!: number;
}
```

### Nested Objects

XPath decorators automatically handle nested objects with their own decorators:

```typescript
class Character {
    @xpath("//div[@class='profile']")
    profile!: Profile;  // Profile class has its own @xpath decorators
}

class Profile {
    @xpath(".//h2/text()")  // Note: relative XPath with ./
    name!: string;

    @xpath(".//p[@class='bio']/text()")
    bio!: string;
}
```

### Working with Raw DOM Nodes

Use `XPathNode` type when you need access to the actual DOM node:

```typescript
import { xpath, XPathNode, getInnerHTML } from '@kazwolfe/flarestone';

class RaceInfo {
    @xpath(".//p[@class='details']")
    _detailsNode!: XPathNode;

    get race(): string {
        // Access innerHTML via getInnerHTML utility
        return getInnerHTML(this._detailsNode).split("<br>")[0].trim();
    }

    get clan(): string {
        return getInnerHTML(this._detailsNode).split("<br>")[1].trim();
    }
}
```

### Options

The `@xpath` decorator accepts several options:

```typescript
interface XPathOptions {
    // Specify type explicitly (useful for arrays or interfaces.ts)
    type?: () => Function;

    // Default value if no match found
    default?: any;

    // Use default if matched node is empty
    defaultIfEmpty?: boolean;

    // Return array of all matches
    many?: boolean;
}
```

Example:

```typescript
class Optional {
    @xpath("//div[@class='optional']/text()", { 
        default: "Not available",
        defaultIfEmpty: true 
    })
    optionalField!: string;
}
```

## API Reference

### Loading Functions

#### `loadObjectFromUrl<T>(url: string, targetClass: new () => T): Promise<T>`
Fetch HTML from a URL and parse it into an object.

```typescript
const char = await loadObjectFromUrl('https://example.com/data', Character);
```

#### `loadObjectFromFile<T>(path: string, targetClass: new () => T): Promise<T>`
Load HTML from a file (Node.js only) and parse it into an object.

```typescript
const char = await loadObjectFromFile('./data.html', Character);
```

#### `loadObjectFromString<T>(html: string, targetClass: new () => T): T`
Parse an HTML string into an object.

```typescript
const char = loadObjectFromString('<html>...</html>', Character);
```

### Pagination Aggregation

For paginated results, use `aggregatePages` or `aggregateItems` to automatically fetch and combine results from all pages:

#### `aggregateItems<T, TItem>(url: string, pageClass: new () => T, itemExtractor: (page: T) => TItem[], options?: AggregationOptions): Promise<TItem[]>`

Simple aggregation that returns just the combined items array:

```typescript
import { aggregateItems } from '@kazwolfe/flarestone';

// Define a paginated model implementing IPagedPage
class SearchResults implements IPagedPage {
    @xpath("//li[@class='result']", { many: true })
    results!: SearchResult[];

    @xpath("//ul[@class='btn__pager']")
    _pager!: Pager;

    getCurrentPage() { return this._pager.currentPage; }
    getNextPageUrl() { return this._pager.getNextPageUrl(); }
    getTotalPages() { return this._pager.totalPages; }
}

// Fetch all results from all pages
const allResults = await aggregateItems(
    'https://example.com/search?q=foo',
    SearchResults,
    (page) => page.results,
    {
        baseUrl: 'https://example.com',
        delayMs: 100  // Rate limiting
    }
);
```

#### `aggregatePages<T, TItem>(url: string, pageClass: new () => T, itemExtractor: (page: T) => TItem[], options?: AggregationOptions): Promise<AggregatedResult<T, TItem>>`

Advanced aggregation that returns items, individual pages, and metadata:

```typescript
const result = await aggregatePages(
    'https://example.com/search?q=foo',
    SearchResults,
    (page) => page.results,
    {
        maxPages: 5,   // Optional: limit pages
        delayMs: 100   // Delay between requests
    }
);

console.log(result.items);  // All items from all pages
console.log(result.metadata.totalPages);  // Total pages available
console.log(result.metadata.pagesFetched);  // Pages actually fetched
console.log(result.metadata.complete);  // Whether all pages were fetched
```

**Options:**
- `maxPages?: number` - Maximum number of pages to fetch (default: Infinity)
- `baseUrl?: string` - Base URL for resolving relative pagination URLs
- `delayMs?: number` - Delay between page fetches to avoid rate limiting (default: 0)

See [docs/PAGINATION_AGGREGATION.md](docs/PAGINATION_AGGREGATION.md) for more examples and details.

### Utility Functions

#### `serializeForJson(obj: any): any`
Convert an object to JSON-serializable format:
- Removes properties starting with `_` (internal use)
- Converts DOM nodes to strings
- Evaluates getters from prototypes
- Handles circular references

```typescript
const json = serializeForJson(character);
console.log(JSON.stringify(json, null, 2));
```

#### `getInnerHTML(node: XPathNode): string`
Get the inner HTML content of a DOM node (similar to `element.innerHTML`):

```typescript
const html = getInnerHTML(node);
const parts = html.split("<br>");
```

## Type Inference

The decorator system uses TypeScript's `design:type` metadata for automatic type inference:

```typescript
class Example {
    @xpath("//span[@class='count']/text()")
    count!: number;  // Automatically converted to number

    @xpath("//input[@class='enabled']/@checked")
    enabled!: boolean;  // Automatically converted to boolean
}
```

Make sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Examples

### Complex Nested Structure

```typescript
class Character {
    @xpath("//h1[@class='name']/text()")
    name!: string;

    @xpath("//div[@class='stats']")
    stats!: Stats;

    @xpath("//ul[@class='equipment']/li", { many: true, type: () => Item })
    equipment!: Item[];
}

class Stats {
    @xpath(".//span[@class='hp']/text()")
    hp!: number;

    @xpath(".//span[@class='mp']/text()")
    mp!: number;
}

class Item {
    @xpath(".//h3/text()")
    name!: string;

    @xpath(".//img/@src")
    iconUrl!: string;

    @xpath(".//span[@class='level']/text()")
    itemLevel!: number;
}
```

### Computed Properties

```typescript
class WorldInfo {
    @xpath("./text()")
    _rawData!: string;  // "Excalibur [Primal]"

    get world(): string {
        return this._rawData.split("[")[0].trim();  // "Excalibur"
    }

    get datacenter(): string {
        return this._rawData.split("[")[1].replace("]", "").trim();  // "Primal"
    }
}
```

## How It Works

1. **HTML Parsing**: HTML is parsed using `htmlparser2` and converted to an XML structure that preserves HTML semantics (e.g., void elements like `<br>`)
2. **XPath Execution**: The `xpath` library executes queries against the parsed DOM
3. **Type Resolution**: Using `reflect-metadata`, the decorator system determines the target type for each property
4. **Value Extraction**: Values are extracted and coerced to the appropriate type:
   - Primitive types (string, number, boolean)
   - Nested objects with their own decorators
   - Arrays via `many: true`
   - Raw DOM nodes via `XPathNode` type
5. **Serialization**: `serializeForJson` converts the final object to clean JSON by evaluating getters and removing internal properties

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

