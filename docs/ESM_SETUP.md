# ESM and TypeScript Setup

## Why `node --loader ts-node/esm` instead of `ts-node --esm`?

This project uses `node --loader ts-node/esm` to run TypeScript files directly, rather than the simpler `ts-node --esm` command. Here's why:

### The Problem

- **ESM modules** require explicit file extensions in imports (e.g., `import './magic.js'` even for `.ts` files)
- Our codebase uses **extensionless imports** (e.g., `import './magic'`) which is the CommonJS/traditional TypeScript style
- To make extensionless imports work with ESM, we use `experimentalSpecifierResolution: "node"` in `tsconfig.json`

### The Solution

**`ts-node --esm`** has a limitation where it doesn't properly respect the `experimentalSpecifierResolution` setting, causing "Cannot find module" errors.

**`node --loader ts-node/esm`** uses Node's native ESM loader infrastructure with ts-node as a hook, which properly honors the experimental specifier resolution setting.

### Running Scripts

```bash
# Run sample.ts
npm run sample

# Or run any TypeScript file directly
node --loader ts-node/esm ./src/your-file.ts
```

### Configuration Files

- **`package.json`**: Sets `"type": "module"` to enable ESM
- **`tsconfig.json`**: Contains `ts-node.esm: true` and `ts-node.experimentalSpecifierResolution: "node"` for extensionless imports
- **Cloudflare Workers**: Still uses standard `tsc` compilation with `"module": "esnext"`, which works fine for production builds

### Alternative Approaches (Not Used)

1. **Add `.js` extensions to all imports** - Would require changing every import statement
2. **Use CommonJS** - Not compatible with Cloudflare Workers' requirements
3. **Use tsx** - Doesn't support decorators, which our code relies on heavily

## Summary

The current setup allows us to:
- ✅ Use decorators (`experimentalDecorators: true`)
- ✅ Use extensionless imports (CommonJS-style)
- ✅ Run with ESM (`"module": "esnext"`)
- ✅ Deploy to Cloudflare Workers
- ✅ Run sample scripts directly with `npm run sample`

