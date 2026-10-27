// CRA 4's source-map loader treats Node's native fetch as browser fetch and
// attempts to fetch a local WASM path. Use its filesystem loader instead.
delete globalThis.fetch;
