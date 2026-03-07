#!/usr/bin/env node

/**
 * generate-metadata.mjs
 *
 * AI-assisted metadata generator for layout anatomy diagrams.
 * Analyzes layout.md AST + component SCSS to produce layout-metadata.json
 * with visual hints (direction, position, sizing, style).
 *
 * Uses `claude -p` (Claude Code CLI) for AI analysis.
 *
 * Usage:
 *   node scripts/layout-to-svg/generate-metadata.mjs [--component name] [--all] [--force]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, dirname, basename } from "node:path";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { parseLayoutFile } from "./parse-layout.mjs";

const SRC_ROOT = resolve("src/components");

// ─── Main ────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  let component = null;
  let all = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--all") all = true;
    else if (args[i] === "--force") force = true;
    else if (args[i] === "--component" && args[i + 1]) component = args[++i];
    else if (!args[i].startsWith("-")) component = args[i];
  }

  if (!component && !all) {
    console.log("Usage: node generate-metadata.mjs [--component name | --all] [--force]");
    process.exit(0);
  }

  const components = all ? findAllComponents() : [component];
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const name of components) {
    const result = processComponent(name, force);
    if (result === "generated") generated++;
    else if (result === "skipped") skipped++;
    else errors++;
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${errors} errors.`);
}

// ─── Component processing ────────────────────────────────────────────────

function processComponent(name, force) {
  const compDir = join(SRC_ROOT, name);
  const layoutPath = join(compDir, "docs", "layout.md");
  const metadataPath = join(compDir, "docs", "layout-metadata.json");
  const scssPath = join(compDir, `${name}.scss`);

  if (!existsSync(layoutPath)) {
    console.error(`  ${name}: no layout.md found, skipping`);
    return "error";
  }

  // Read sources
  const layoutContent = readFileSync(layoutPath, "utf-8");
  const scssContent = existsSync(scssPath) ? readFileSync(scssPath, "utf-8") : "";

  // Compute hash of sources
  const sourceHash = computeHash(layoutContent + scssContent);

  // Check existing metadata
  if (!force && existsSync(metadataPath)) {
    try {
      const existing = JSON.parse(readFileSync(metadataPath, "utf-8"));
      if (existing.sourceHash === sourceHash) {
        console.log(`  ${name}: no changes (skipped)`);
        return "skipped";
      }
    } catch {
      // Corrupted metadata, regenerate
    }
  }

  // Parse the layout
  let cases;
  try {
    cases = parseLayoutFile(layoutPath);
  } catch (err) {
    console.error(`  ${name}: parse error - ${err.message}`);
    return "error";
  }

  // Load existing metadata to preserve manual entries
  let existingMeta = null;
  if (existsSync(metadataPath)) {
    try {
      existingMeta = JSON.parse(readFileSync(metadataPath, "utf-8"));
    } catch {
      // Will regenerate from scratch
    }
  }

  // Collect sub-component SCSS if needed
  const subScss = collectSubComponentScss(cases, name);

  // Generate metadata via AI
  try {
    const metadata = generateWithAI(name, cases, scssContent, subScss, existingMeta);
    metadata.component = name;
    metadata.sourceHash = sourceHash;

    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf-8");
    console.log(`  ${name}: metadata generated (${metadata.cases.length} case(s))`);
    return "generated";
  } catch (err) {
    console.error(`  ${name}: AI generation failed - ${err.message}`);
    return "error";
  }
}

// ─── AI invocation ───────────────────────────────────────────────────────

function generateWithAI(name, cases, scssContent, subScss, existingMeta) {
  const prompt = buildPrompt(name, cases, scssContent, subScss, existingMeta);

  // Write prompt to temp file to avoid shell escaping issues
  const tmpFile = `/tmp/layout-metadata-prompt-${name}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");

  try {
    const result = execSync(
      `cat "${tmpFile}" | claude -p --output-format json`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 120000 }
    );

    // Parse the JSON response — claude may wrap it in a result object
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      // Try to extract JSON from the response text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    // Handle claude -p output format: { result: "..." }
    if (parsed.result && typeof parsed.result === "string") {
      const innerMatch = parsed.result.match(/\{[\s\S]*\}/);
      if (innerMatch) {
        parsed = JSON.parse(innerMatch[0]);
      }
    }

    return parsed;
  } finally {
    try {
      execSync(`rm -f "${tmpFile}"`, { encoding: "utf-8" });
    } catch {
      // Ignore cleanup errors
    }
  }
}

function buildPrompt(name, cases, scssContent, subScss, existingMeta) {
  const casesJson = JSON.stringify(cases, null, 2);
  const manualEntries = existingMeta ? extractManualEntries(existingMeta) : null;

  return `You are generating layout metadata for a web component anatomy SVG diagram.

## Component: ${name}

## Layout AST (parsed from layout.md)
\`\`\`json
${casesJson}
\`\`\`

## Component SCSS
\`\`\`scss
${scssContent || "(no SCSS file)"}
\`\`\`

${subScss ? `## Sub-component SCSS\n\`\`\`scss\n${subScss}\n\`\`\`` : ""}

${manualEntries ? `## Existing manual entries (PRESERVE these exactly)\n\`\`\`json\n${JSON.stringify(manualEntries, null, 2)}\n\`\`\`` : ""}

## Task

Generate a JSON object matching this schema:

\`\`\`typescript
interface LayoutMetadata {
  cases: Array<{
    case: number;
    title: string;
    canvas: { width: number; height: number };
    nodes: Record<string, NodeVisualHints>;
  }>;
}

interface NodeVisualHints {
  direction?: "row" | "column";    // Layout direction for children
  position?: "flow" | "absolute" | "overlay";  // Positioning mode
  widthRatio?: number;             // 0-1 relative to parent
  heightRatio?: number;            // 0-1 relative to parent
  fixedWidth?: number;             // Fixed pixel width
  fixedHeight?: number;            // Fixed pixel height
  alignSelf?: "start" | "center" | "end" | "stretch";
  hidden?: boolean;                // True for invisible wrapper divs
  label?: string;                  // Override label text
  style?: "container" | "interactive" | "text" | "decorative" | "slot";
}
\`\`\`

Node paths use dot-separated child indices: "0" = root, "0.0" = first child, "0.1" = second child, etc.

## SCSS Analysis Rules

1. **direction**: \`display: flex\` → check \`flex-direction\` (default row). \`display: grid\` → check \`grid-auto-flow\` or template. \`display: inline-grid; grid-auto-flow: column\` → "row". \`display: contents\` → inherit parent direction (mark hidden).
2. **position**: \`position: absolute/fixed\` → "absolute". \`popover\` attribute → "overlay". Everything else → "flow".
3. **widthRatio**: Infer from \`inline-size\`, \`width\`, \`flex: 1\`, etc. Use 1.0 for full-width.
4. **hidden**: \`display: contents\` or pure structural wrappers with no visual properties → hidden.
5. **style**: button/input/a/select → "interactive". slot → "slot". Text content → "text". hr/img/canvas → "decorative". Everything else → "container".

## Rules

- Only include nodes that DIFFER from these defaults: direction="column", position="flow", style=inferred-from-tag
- If an existing entry has "manual": true, preserve it exactly as-is
- Canvas size: estimate based on component complexity (simple: 400x300, medium: 600x500, complex: 800x700)
- Output ONLY the JSON object, no markdown fences, no explanation`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function computeHash(content) {
  return createHash("sha256").update(content).digest("hex").substring(0, 16);
}

function findAllComponents() {
  const results = [];
  for (const entry of readdirSync(SRC_ROOT, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const layoutPath = join(SRC_ROOT, entry.name, "docs", "layout.md");
      if (existsSync(layoutPath)) {
        results.push(entry.name);
      }
    }
  }
  return results.sort();
}

function collectSubComponentScss(cases, componentName) {
  // Find ch-* sub-component tags referenced in the AST
  const subTags = new Set();

  function walk(node) {
    if (node.tag && node.tag.startsWith("ch-") && node.tag !== `ch-${componentName}`) {
      // Convert tag to directory name: ch-foo-bar → foo-bar
      const dirName = node.tag.replace(/^ch-/, "");
      subTags.add(dirName);
    }
    if (node.children) node.children.forEach(walk);
  }

  for (const c of cases) walk(c.ast);

  // Read sub-component SCSS files
  const parts = [];
  for (const tag of subTags) {
    const scssPath = join(SRC_ROOT, tag, `${tag}.scss`);
    if (existsSync(scssPath)) {
      parts.push(`/* --- ${tag}.scss --- */\n${readFileSync(scssPath, "utf-8")}`);
    }
  }

  return parts.length > 0 ? parts.join("\n\n") : null;
}

function extractManualEntries(metadata) {
  const manual = {};
  let hasManual = false;

  for (const caseMeta of metadata.cases || []) {
    for (const [path, hints] of Object.entries(caseMeta.nodes || {})) {
      if (hints.manual) {
        if (!manual[caseMeta.case]) manual[caseMeta.case] = {};
        manual[caseMeta.case][path] = hints;
        hasManual = true;
      }
    }
  }

  return hasManual ? manual : null;
}

// ─── Run ─────────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("generate-metadata.mjs")) {
  main();
}
