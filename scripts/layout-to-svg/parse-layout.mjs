#!/usr/bin/env node

/**
 * parse-layout.mjs
 *
 * Parses layout.md files into a typed AST.
 *
 * Usage:
 *   node scripts/layout-to-svg/parse-layout.mjs <path-to-layout.md>
 *
 * Output: JSON AST to stdout
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Parse a layout.md file from disk.
 * @param {string} filePath
 * @returns {Array<{case: number, title: string, ast: object}>}
 */
export function parseLayoutFile(filePath) {
  const content = readFileSync(resolve(filePath), "utf-8");
  return parseLayoutMd(content);
}

/**
 * Parse layout.md markdown content.
 * @param {string} markdown
 * @returns {Array<{case: number, title: string, ast: object}>}
 */
export function parseLayoutMd(markdown) {
  const cases = splitCases(markdown);
  return cases.map(c => ({
    case: c.number,
    title: c.title,
    ast: parseCodeBlock(c.code)
  }));
}

/**
 * Parse a part attribute string into structured entries.
 * @param {string} partString
 * @returns {import('./types').PartEntry[]}
 */
export function parseParts(partString) {
  if (!partString) return [];

  const parts = [];
  const regex = /\[\{([^}]+)\}\]|\{([^}]+)\}|\[([^\]]+)\]|(\S+)/g;
  let match;

  while ((match = regex.exec(partString)) !== null) {
    if (match[1] !== undefined) {
      // [{dynamic conditional}]
      parts.push({ name: match[1], dynamic: true, conditional: true });
    } else if (match[2] !== undefined) {
      // {dynamic}
      parts.push({ name: match[2], dynamic: true, conditional: false });
    } else if (match[3] !== undefined) {
      // [conditional] or [a | b | c]
      const inner = match[3].trim();
      if (inner.includes(" | ")) {
        const exclusive = inner.split(/\s*\|\s*/);
        parts.push({
          name: inner,
          dynamic: false,
          conditional: true,
          exclusive
        });
      } else {
        parts.push({ name: inner, dynamic: false, conditional: true });
      }
    } else if (match[4] !== undefined) {
      // static
      parts.push({ name: match[4], dynamic: false, conditional: false });
    }
  }

  return parts;
}

// ─── Case splitting ──────────────────────────────────────────────────────

function splitCases(markdown) {
  const cases = [];
  const caseRegex = /^##\s+Case\s+(\d+):\s*(.+)$/gm;
  let match;
  const headers = [];

  while ((match = caseRegex.exec(markdown)) !== null) {
    headers.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      index: match.index
    });
  }

  // No case headers — treat the whole file as one case
  if (headers.length === 0) {
    const code = extractCodeBlock(markdown);
    if (code) return [{ number: 1, title: "Default", code }];
    return [];
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : markdown.length;
    const section = markdown.substring(start, end);
    const code = extractCodeBlock(section);
    if (code) {
      cases.push({
        number: headers[i].number,
        title: headers[i].title,
        code
      });
    }
  }

  return cases;
}

function extractCodeBlock(text) {
  const match = text.match(/```\n([\s\S]*?)\n```/);
  return match ? match[1] : null;
}

// ─── Code block parser ───────────────────────────────────────────────────

function parseCodeBlock(code) {
  const lines = code.split("\n");
  const tokens = [];

  for (const line of lines) {
    const token = tokenizeLine(line);
    if (token) tokens.push(token);
  }

  return buildTree(tokens);
}

/**
 * Tokenize a single line: determine shadow depth and extract content.
 */
function tokenizeLine(raw) {
  if (!raw.trim()) return null;

  let shadowDepth = 0;
  let i = 0;

  // Walk through the prefix counting pipe characters
  while (i < raw.length) {
    if (raw[i] === " " || raw[i] === "\t") {
      i++;
    } else if (raw[i] === "|") {
      shadowDepth++;
      i++;
      // Skip optional space after pipe
      if (i < raw.length && raw[i] === " ") i++;
    } else {
      break;
    }
  }

  const content = raw.substring(i).trimEnd();
  if (!content) return null;

  return { shadowDepth, content };
}

// ─── Content parsing ─────────────────────────────────────────────────────

function parseContent(content) {
  content = content.trim();
  if (!content) return null;

  // #shadow-root marker
  if (content === "#shadow-root") {
    return { type: "shadow-root" };
  }

  // HTML comment
  if (content.startsWith("<!--") && content.endsWith("-->")) {
    const text = content.slice(4, -3).trim();
    return parseComment(text);
  }

  // Closing tag
  if (content.startsWith("</")) {
    const match = content.match(/^<\/(\w[\w-]*)>$/);
    return match ? { type: "close-tag", tag: match[1] } : null;
  }

  // Any tag
  if (content.startsWith("<")) {
    return parseTag(content);
  }

  // Plain text content
  return { type: "text", text: content };
}

function parseTag(content) {
  const selfClosing = content.endsWith("/>");

  // Extract tag name
  const tagMatch = content.match(/^<(\w[\w-]*)/);
  if (!tagMatch) return null;
  const tag = tagMatch[1];

  if (selfClosing) {
    const attrStr = content.slice(tagMatch[0].length, -2).trim();
    return { type: "self-closing", tag, attributes: parseAttributes(attrStr) };
  }

  // Same-line close: <tag ...>inner</tag>
  const closeTag = `</${tag}>`;
  const closeIdx = content.lastIndexOf(closeTag);
  if (closeIdx !== -1) {
    const firstGt = content.indexOf(">");
    const attrStr = content.substring(tagMatch[0].length, firstGt).trim();
    const innerText = content.substring(firstGt + 1, closeIdx).trim();
    return {
      type: "same-line",
      tag,
      attributes: parseAttributes(attrStr),
      innerText: innerText || null
    };
  }

  // Opening tag
  const lastGt = content.lastIndexOf(">");
  const attrStr = content.substring(tagMatch[0].length, lastGt).trim();
  return { type: "open-tag", tag, attributes: parseAttributes(attrStr) };
}

function parseComment(text) {
  // when condition
  const whenMatch = text.match(/^when\s+(.+)$/);
  if (whenMatch) return { type: "comment-when", condition: whenMatch[1] };

  // else when condition
  const elseWhenMatch = text.match(/^else when\s+(.+)$/);
  if (elseWhenMatch) {
    return { type: "comment-else-when", condition: elseWhenMatch[1] };
  }

  // else or else (description)
  const elseMatch = text.match(/^else(?:\s*\((.+)\))?$/);
  if (elseMatch) {
    return { type: "comment-else", description: elseMatch[1] || null };
  }

  // for each X in Y
  const forEachMatch = text.match(/^for each\s+(\w+)\s+in\s+(.+)$/);
  if (forEachMatch) {
    return {
      type: "comment-for-each",
      item: forEachMatch[1],
      collection: forEachMatch[2]
    };
  }

  // Descriptive comment
  return { type: "comment-descriptive", text };
}

function parseAttributes(attrStr) {
  const attrs = {};
  if (!attrStr) return attrs;

  const regex = /([\w-]+)(?:="([^"]*)")?/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    attrs[match[1]] = match[2] !== undefined ? match[2] : true;
  }
  return attrs;
}

// ─── Tree builder ────────────────────────────────────────────────────────

function buildTree(tokens) {
  const root = { type: "root", children: [] };
  const stack = [root];

  const current = () => stack[stack.length - 1];

  for (const token of tokens) {
    const parsed = parseContent(token.content);
    if (!parsed) continue;

    switch (parsed.type) {
      case "shadow-root":
        current().shadowRoot = true;
        break;

      case "open-tag": {
        const node = createElementNode(
          parsed.tag,
          parsed.attributes,
          token.shadowDepth
        );
        current().children.push(node);
        stack.push(node);
        break;
      }

      case "close-tag": {
        // Pop stack to find the matching open tag
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tag === parsed.tag) {
            stack.length = i;
            break;
          }
        }
        break;
      }

      case "self-closing":
      case "same-line": {
        const node = createElementNode(
          parsed.tag,
          parsed.attributes,
          token.shadowDepth
        );
        if (parsed.type === "same-line" && parsed.innerText) {
          node.children = [
            { type: "text", text: parsed.innerText, shadowDepth: token.shadowDepth }
          ];
        }
        current().children.push(node);
        break;
      }

      case "text":
        current().children.push({
          type: "text",
          text: parsed.text,
          shadowDepth: token.shadowDepth
        });
        break;

      case "comment-when":
        current().children.push({
          type: "comment-when",
          condition: parsed.condition,
          shadowDepth: token.shadowDepth
        });
        break;

      case "comment-else":
        current().children.push({
          type: "comment-else",
          description: parsed.description,
          shadowDepth: token.shadowDepth
        });
        break;

      case "comment-else-when":
        current().children.push({
          type: "comment-else-when",
          condition: parsed.condition,
          shadowDepth: token.shadowDepth
        });
        break;

      case "comment-for-each":
        current().children.push({
          type: "comment-for-each",
          iteration: { item: parsed.item, collection: parsed.collection },
          shadowDepth: token.shadowDepth
        });
        break;

      case "comment-descriptive":
        current().children.push({
          type: "comment-descriptive",
          text: parsed.text,
          shadowDepth: token.shadowDepth
        });
        break;
    }
  }

  return root.children.length === 1 ? root.children[0] : root;
}

function createElementNode(tag, attributes, shadowDepth) {
  const node = {
    type: tag === "slot" ? "slot" : "element",
    tag,
    shadowDepth,
    children: []
  };

  if (attributes.part) {
    node.parts = parseParts(attributes.part);
  }

  // Copy non-part attributes
  const attrs = { ...attributes };
  delete attrs.part;
  if (Object.keys(attrs).length > 0) {
    node.attributes = attrs;
  }

  return node;
}

// ─── CLI ─────────────────────────────────────────────────────────────────

// Only run CLI when this script is executed directly
if (process.argv[1]?.endsWith("parse-layout.mjs")) {
  const args = process.argv.slice(2);
  if (args.length > 0 && !args[0].startsWith("-")) {
    const filePath = resolve(args[0]);
    try {
      const result = parseLayoutFile(filePath);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`Error parsing ${filePath}: ${err.message}`);
      process.exit(1);
    }
  }
}
