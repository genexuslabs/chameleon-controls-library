import type { ComponentRenderModel } from "../../src/components/playground-editor/typings/component-render";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         Types
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export type PlaygroundState = {
  mode: 1 | 2;
  /** Mode 1: the component render model (property editor state). */
  model?: ComponentRenderModel;
  /** Mode 1: the component tag name. */
  componentName?: string;
  /** Mode 2: open tabs in the code editor. */
  tabs?: { name: string; code: string }[];
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   Encode / Decode
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/** Base64url encode (URL-safe, no padding). */
function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Base64url decode. */
function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Compress a string using deflate-raw and return base64url-encoded bytes. */
export async function encodeState(state: PlaygroundState): Promise<string> {
  const json = JSON.stringify(state);
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(json);

  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();

  writer.write(inputBytes);
  writer.close();

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return base64urlEncode(merged);
}

/** Decompress a base64url-encoded deflate-raw string back to a PlaygroundState. */
export async function decodeState(encoded: string): Promise<PlaygroundState | null> {
  try {
    const compressed = base64urlDecode(encoded);

    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(compressed);
    writer.close();

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const json = new TextDecoder().decode(merged);
    return JSON.parse(json) as PlaygroundState;
  } catch {
    return null;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   URL hash helpers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const HASH_PREFIX = "p1=";

/** Read playground state from the current URL hash. Returns null if absent or invalid. */
export async function readStateFromHash(): Promise<PlaygroundState | null> {
  const hash = window.location.hash.slice(1); // strip leading #
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const encoded = hash.slice(HASH_PREFIX.length);
  return decodeState(encoded);
}

/** Write playground state to the URL hash without adding a history entry. Debounced by caller. */
export async function writeStateToHash(state: PlaygroundState): Promise<void> {
  const encoded = await encodeState(state);
  const newHash = `#${HASH_PREFIX}${encoded}`;
  history.replaceState(null, "", newHash);
}

/** Clear the playground hash from the URL. */
export function clearHash(): void {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
