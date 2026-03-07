#!/usr/bin/env node

/**
 * render-svg.mjs
 *
 * Deterministic SVG anatomy renderer.
 * Takes a layout.md AST (+ optional metadata.json) and produces SVG files.
 *
 * Usage:
 *   node scripts/layout-to-svg/render-svg.mjs <path-to-layout.md> [--metadata path] [--out dir]
 *   node scripts/layout-to-svg/render-svg.mjs --all [--out dir]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { parseLayoutFile } from "./parse-layout.mjs";
import {
  SIZES,
  COLORS,
  BADGE_COLORS,
  SHADOW_TINTS,
  inferStyle,
  defaultHints
} from "./defaults.mjs";
import {
  svgRect,
  svgText,
  svgGroup,
  svgBadge,
  svgDashedRect,
  svgDocument,
  esc
} from "./svg-primitives.mjs";

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Render anatomy SVGs for a layout.md file.
 * @param {string} layoutPath - Path to layout.md
 * @param {string} [metadataPath] - Optional path to layout-metadata.json
 * @param {string} [outputDir] - Output directory (defaults to same dir as layout.md)
 * @returns {string[]} Paths to generated SVG files
 */
export function renderLayoutFile(layoutPath, metadataPath, outputDir) {
  const cases = parseLayoutFile(layoutPath);
  const outDir = outputDir || dirname(layoutPath);
  const metadata = metadataPath && existsSync(metadataPath)
    ? JSON.parse(readFileSync(metadataPath, "utf-8"))
    : null;

  const generatedFiles = [];

  for (const layoutCase of cases) {
    const caseMeta = metadata?.cases?.find(c => c.case === layoutCase.case) || null;
    const svg = renderCase(layoutCase.ast, caseMeta);
    const fileName = `anatomy-case-${layoutCase.case}.svg`;
    const outPath = join(outDir, fileName);
    writeFileSync(outPath, svg, "utf-8");
    generatedFiles.push(outPath);
  }

  return generatedFiles;
}

// ─── Rendering pipeline ──────────────────────────────────────────────────

function renderCase(ast, caseMeta) {
  const measured = measure(ast, caseMeta, "0");
  const positioned = position(ast, measured, SIZES.padding, SIZES.padding);

  const diagramWidth = measured.width + SIZES.padding * 2;
  const diagramHeight = measured.height + SIZES.padding * 2;

  const legend = renderLegend(SIZES.padding, diagramHeight + 8, diagramWidth);
  const totalWidth = diagramWidth;
  const totalHeight = diagramHeight + 8 + legend.height + SIZES.padding;

  const content = renderNode(positioned) + legend.svg;
  return svgDocument(content, totalWidth, totalHeight);
}

// ─── Phase 1: Measure (bottom-up) ────────────────────────────────────────

function measure(node, caseMeta, path) {
  const hints = getHints(node, caseMeta, path);

  // Skip hidden nodes
  if (hints.hidden) {
    return { width: 0, height: 0, label: { primary: "", width: 0, height: 0 }, childMeasurements: [], hints, path };
  }

  const label = computeLabel(node);

  // Comment nodes and text nodes are rendered as inline badges/labels, not boxes
  if (isCommentNode(node)) {
    return {
      width: label.width,
      height: label.height,
      label, childMeasurements: [], hints, direction: "column", path
    };
  }
  if (node.type === "text") {
    return {
      width: label.width,
      height: label.height,
      label, childMeasurements: [], hints, direction: "column", path
    };
  }

  const visibleChildren = getVisibleChildren(node);
  const direction = hints.direction || "column";

  // Leaf element (no children)
  if (visibleChildren.length === 0) {
    const w = Math.max(label.width + SIZES.padding * 2, SIZES.minWidth);
    const h = Math.max(label.height + SIZES.padding * 2, SIZES.minHeight);
    return { width: w, height: h, label, childMeasurements: [], hints, direction, path };
  }

  // Measure children
  const childMeasurements = visibleChildren.map((child, i) => ({
    node: child,
    ...measure(child, caseMeta, `${path}.${i}`)
  }));

  // Filter out zero-size children (hidden)
  const visibleMeasurements = childMeasurements.filter(
    c => c.width > 0 && c.height > 0
  );

  let contentWidth, contentHeight;

  // Check if any children are condition comments (need indent for their content)
  const hasConditions = visibleMeasurements.some(c => isCommentNode(c.node));
  const condIndentWidth = hasConditions ? SIZES.condIndent : 0;

  if (direction === "row") {
    contentWidth =
      visibleMeasurements.reduce((sum, c) => sum + c.width, 0) +
      Math.max(0, visibleMeasurements.length - 1) * SIZES.gap;
    contentHeight = Math.max(0, ...visibleMeasurements.map(c => c.height));
  } else {
    // Indented content may be wider than badges, account for both
    const badgeWidths = visibleMeasurements.filter(c => isCommentNode(c.node)).map(c => c.width);
    const contentWidths = visibleMeasurements.filter(c => !isCommentNode(c.node)).map(c => c.width + condIndentWidth);
    contentWidth = Math.max(0, ...badgeWidths, ...contentWidths);
    contentHeight = computeColumnHeight(visibleMeasurements);
  }

  const labelSpace = label.height > 0 ? label.height + SIZES.labelGap : 0;

  // Shadow boundary adds extra padding
  const extraPad = node.shadowRoot ? SIZES.shadowPad : 0;

  const width = Math.max(
    label.width + SIZES.padding * 2,
    contentWidth + SIZES.padding * 2 + extraPad * 2,
    SIZES.minWidth
  );
  const height = Math.max(
    SIZES.padding + labelSpace + contentHeight + SIZES.padding + extraPad,
    SIZES.minHeight
  );

  return { width, height, label, childMeasurements, hints, direction, path };
}

// ─── Phase 2: Position (top-down) ────────────────────────────────────────

function position(node, measurement, x, y) {
  const { label, childMeasurements, hints, direction, path } = measurement;

  const result = {
    node,
    x,
    y,
    width: measurement.width,
    height: measurement.height,
    label,
    hints,
    path,
    children: []
  };

  const labelSpace = label.height > 0 ? label.height + SIZES.labelGap : 0;
  const extraPad = node.shadowRoot ? SIZES.shadowPad : 0;

  let cx = x + SIZES.padding + extraPad;
  let cy = y + SIZES.padding + labelSpace;

  if (node.shadowRoot) {
    // Offset children inside the shadow boundary
    cy += SIZES.shadowPad;
  }

  const visibleMeasurements = childMeasurements.filter(
    c => c.width > 0 && c.height > 0
  );

  // Track condition scopes for indentation and scope lines
  const hasConditions = visibleMeasurements.some(c => isCommentNode(c.node));
  const condIndent = hasConditions ? SIZES.condIndent : 0;
  let inCondScope = false;
  result.condScopes = [];
  let currentScope = null;

  for (let i = 0; i < visibleMeasurements.length; i++) {
    const childMeasure = visibleMeasurements[i];
    const childNode = childMeasure.node;

    if (direction === "row") {
      const childPos = position(childNode, childMeasure, cx, cy);
      result.children.push(childPos);
      cx += childMeasure.width + SIZES.gap;
    } else {
      if (isCommentNode(childNode)) {
        // Close previous scope if it exists
        if (currentScope) {
          currentScope.endY = cy - SIZES.commentGap;
          result.condScopes.push(currentScope);
        }
        // Place badge at base indent
        const childPos = position(childNode, childMeasure, cx, cy);
        result.children.push(childPos);
        // Start new scope
        const scopeColor = getScopeColor(childNode);
        currentScope = { startY: cy + childMeasure.height, endY: cy + childMeasure.height, x: cx + condIndent - 4, color: scopeColor };
        inCondScope = true;
      } else {
        // Content element: indent if under a condition
        const childCx = inCondScope ? cx + condIndent : cx;
        const childPos = position(childNode, childMeasure, childCx, cy);
        result.children.push(childPos);
        // Extend scope to cover this child
        if (currentScope) {
          currentScope.endY = cy + childMeasure.height;
        }
      }

      const gap = gapAfterChild(childMeasure, visibleMeasurements[i + 1]);
      cy += childMeasure.height + gap;
    }
  }

  // Close final scope
  if (currentScope && currentScope.endY > currentScope.startY) {
    result.condScopes.push(currentScope);
  }

  return result;
}

// ─── Phase 3: Render to SVG ──────────────────────────────────────────────

function renderNode(positioned) {
  const { node, x, y, width, height, label, hints, children } = positioned;

  // Skip nodes with no size
  if (width <= 0 || height <= 0) return "";

  let svg = "";
  const style = hints?.style || inferStyle(node);
  const colors = COLORS[style] || COLORS.container;

  // Determine if this is a comment-type node
  if (isCommentNode(node)) {
    svg += renderCommentNode(positioned);
    return svg;
  }

  // Determine if this is a text node
  if (node.type === "text") {
    svg += renderTextNode(positioned);
    return svg;
  }

  // Background rectangle
  const isSlot = style === "slot";
  svg += svgRect(x, y, width, height, {
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: isSlot ? 1.5 : 1,
    strokeDasharray: isSlot ? "4 2" : undefined,
    rx: 4
  });

  // Floating tag pill (sits on top border of the box)
  if (label.tagText) {
    const pillX = x + SIZES.padding;
    const pillY = y - SIZES.tagFloat;
    const pillW = label.tagWidth;
    const pillH = SIZES.tagPillHeight;

    // Background pill that "cuts" the border
    svg += svgRect(pillX, pillY, pillW, pillH, {
      fill: colors.fill === "#ffffff" ? "#ffffff" : colors.fill,
      stroke: colors.stroke,
      strokeWidth: 1,
      rx: 3
    });
    svg += svgText(pillX + SIZES.tagPillPadX, pillY + pillH - 3, label.tagText, {
      fontSize: SIZES.tagFontSize,
      fill: colors.text,
      fontWeight: "bold"
    });
  }

  // Shadow root boundary
  if (node.shadowRoot) {
    const shadowY = y + SIZES.padding + label.height + SIZES.labelGap;
    const shadowHeight = height - SIZES.padding - label.height - SIZES.labelGap - SIZES.shadowPad / 2;
    svg += svgDashedRect(
      x + SIZES.shadowPad / 2,
      shadowY,
      width - SIZES.shadowPad,
      shadowHeight,
      { stroke: COLORS.shadow.stroke, label: "#shadow-root" }
    );
  }

  // Internal labels
  let labelY = y + SIZES.padding;

  // Inline tag for slots (rendered inside the box, not as floating pill)
  if (label.inlineTag) {
    svg += svgText(x + SIZES.padding, labelY + SIZES.tagFontSize, label.inlineTag, {
      fontSize: SIZES.tagFontSize,
      fill: colors.text,
      fontWeight: "bold"
    });
    labelY += SIZES.tagFontSize + 2;
  }

  // Static part names
  if (label.primary) {
    svg += svgText(x + SIZES.padding, labelY + SIZES.partFontSize, label.primary, {
      fontSize: SIZES.partFontSize,
      fill: colors.text
    });
    labelY += SIZES.partFontSize + 2;
  }

  // Conditional/dynamic parts (smaller, italic)
  if (label.conditional) {
    svg += svgText(x + SIZES.padding, labelY + SIZES.condFontSize, label.conditional, {
      fontSize: SIZES.condFontSize,
      fill: "#888",
      fontStyle: "italic"
    });
  }

  // Render condition scope lines (thin vertical lines showing condition extent)
  if (positioned.condScopes) {
    for (const scope of positioned.condScopes) {
      if (scope.endY > scope.startY) {
        svg += `<line x1="${scope.x}" y1="${scope.startY}" x2="${scope.x}" y2="${scope.endY}" stroke="${scope.color}" stroke-width="2" stroke-opacity="0.4" stroke-linecap="round" />\n`;
      }
    }
  }

  // Render children
  for (const child of children) {
    svg += renderNode(child);
  }

  return svg;
}

function renderCommentNode(positioned) {
  const { node, x, y, width, height } = positioned;

  let badgeColor, text;

  switch (node.type) {
    case "comment-when":
      badgeColor = BADGE_COLORS.when;
      text = `\u25C7 when ${node.condition}`;
      break;
    case "comment-else":
      badgeColor = BADGE_COLORS.else;
      text = node.description ? `\u25C7 else (${node.description})` : "\u25C7 else";
      break;
    case "comment-else-when":
      badgeColor = BADGE_COLORS.else;
      text = `\u25C7 else when ${node.condition}`;
      break;
    case "comment-for-each":
      badgeColor = BADGE_COLORS["for-each"];
      text = `\u21BB for each ${node.iteration.item} in ${node.iteration.collection}`;
      break;
    case "comment-descriptive":
      badgeColor = BADGE_COLORS.descriptive;
      text = node.text;
      break;
    default:
      return "";
  }

  // Truncate long text
  const maxLen = 60;
  if (text.length > maxLen) text = text.substring(0, maxLen - 1) + "\u2026";

  return svgBadge(x, y, text, {
    bgColor: badgeColor.fill,
    textColor: badgeColor.text,
    fontSize: SIZES.condFontSize,
    height: SIZES.badgeHeight,
    paddingX: SIZES.badgePadX,
    rx: SIZES.badgeRadius
  });
}

function renderTextNode(positioned) {
  const { node, x, y } = positioned;
  return svgText(x, y + SIZES.lineHeight, `"${node.text}"`, {
    fontSize: SIZES.partFontSize,
    fill: "#888",
    fontStyle: "italic"
  });
}

// ─── Label computation ───────────────────────────────────────────────────

function computeLabel(node) {
  if (isCommentNode(node)) {
    const text = commentText(node);
    const truncated = text.length > 60 ? text.substring(0, 59) + "\u2026" : text;
    return {
      primary: "",
      width: truncated.length * SIZES.condFontSize * 0.6 + SIZES.badgePadX * 2,
      height: SIZES.badgeHeight
    };
  }

  if (node.type === "text") {
    const display = `"${node.text}"`;
    return {
      primary: display,
      width: display.length * SIZES.charWidth,
      height: SIZES.lineHeight
    };
  }

  const tag = node.tag || "";
  const parts = node.parts || [];

  // Static parts
  const staticParts = parts.filter(p => !p.conditional && !p.dynamic);
  // Conditional parts
  const condParts = parts.filter(p => p.conditional || p.dynamic);

  // Primary: static part names
  const primary = staticParts.length > 0
    ? staticParts.map(p => p.name).join(" ")
    : "";

  // Tag name: floating pill for most elements, inline for slots
  const isSlotNode = node.type === "slot";
  const tagRaw = `<${tag}>`;
  const tagText = isSlotNode ? null : tagRaw;
  const tagWidth = isSlotNode ? 0 : Math.ceil(tagRaw.length * SIZES.charWidth * 0.85 + SIZES.tagPillPadX * 2);

  // Conditional line
  const conditional = condParts.length > 0
    ? condParts.map(p => {
        if (p.dynamic && p.conditional) return `[{${p.name}}]`;
        if (p.dynamic) return `{${p.name}}`;
        if (p.exclusive) return `[${p.exclusive.join("|")}]`;
        return `[${p.name}]`;
      }).join(" ")
    : "";

  // Calculate dimensions (floating tag is not included in internal height, inline tag is)
  let maxWidth = tagWidth; // Tag pill width still contributes to min width
  let totalHeight = 0;

  // Slots keep the tag inside the box
  if (isSlotNode) {
    maxWidth = Math.max(maxWidth, tagRaw.length * SIZES.charWidth * 0.85);
    totalHeight += SIZES.tagFontSize + 2;
  }

  if (primary) {
    maxWidth = Math.max(maxWidth, primary.length * SIZES.charWidth);
    totalHeight += SIZES.partFontSize + 2;
  }
  if (conditional) {
    maxWidth = Math.max(maxWidth, conditional.length * SIZES.charWidth * 0.85);
    totalHeight += SIZES.condFontSize + 2;
  }

  return { primary, tagText, tagWidth, inlineTag: isSlotNode ? tagRaw : null, conditional, parts, width: maxWidth, height: totalHeight };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function isCommentNode(node) {
  return (
    node.type === "comment-when" ||
    node.type === "comment-else" ||
    node.type === "comment-else-when" ||
    node.type === "comment-for-each" ||
    node.type === "comment-descriptive"
  );
}

function commentText(node) {
  switch (node.type) {
    case "comment-when":
      return `when ${node.condition}`;
    case "comment-else":
      return node.description ? `else (${node.description})` : "else";
    case "comment-else-when":
      return `else when ${node.condition}`;
    case "comment-for-each":
      return `for each ${node.iteration.item} in ${node.iteration.collection}`;
    case "comment-descriptive":
      return node.text;
    default:
      return "";
  }
}

function getScopeColor(node) {
  switch (node.type) {
    case "comment-when":
    case "comment-else-when":
      return BADGE_COLORS.when.fill;
    case "comment-else":
      return BADGE_COLORS.else.fill;
    case "comment-for-each":
      return BADGE_COLORS["for-each"].fill;
    default:
      return BADGE_COLORS.descriptive.fill;
  }
}

function getVisibleChildren(node) {
  if (!node.children || !Array.isArray(node.children)) return [];
  return node.children;
}

/**
 * Compute the gap after a child in a column layout.
 * Comments use a tiny gap so they stick to the element they annotate.
 */
function hasFloatingPill(node) {
  return node.tag && node.type !== "slot" && node.type !== "text" && !isCommentNode(node);
}

function gapAfterChild(currentMeasure, nextMeasure) {
  if (!nextMeasure) return 0;
  const pillMargin = hasFloatingPill(nextMeasure.node) ? SIZES.tagFloat : 0;
  // Comment followed by anything: tiny gap (badge sticks to next element)
  if (isCommentNode(currentMeasure.node)) return SIZES.commentGap + pillMargin;
  return SIZES.gap + pillMargin;
}

/**
 * Compute total column height accounting for variable gaps between children.
 * Comments get a smaller gap to their next sibling.
 */
function computeColumnHeight(measurements) {
  if (measurements.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < measurements.length; i++) {
    total += measurements[i].height;
    if (i < measurements.length - 1) {
      total += gapAfterChild(measurements[i], measurements[i + 1]);
    }
  }
  return total;
}

function getHints(node, caseMeta, path) {
  if (caseMeta?.nodes?.[path]) {
    return { ...defaultHints(node), ...caseMeta.nodes[path] };
  }
  return defaultHints(node);
}

// ─── Legend ──────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  {
    label: "#shadow-root",
    render: (x, y) => {
      let s = `<line x1="${x}" y1="${y + 6}" x2="${x + 24}" y2="${y + 6}" stroke="#9e9e9e" stroke-width="1.5" stroke-dasharray="4 2" />\n`;
      s += svgText(x + 28, y + 10, "#shadow-root", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 100 };
    }
  },
  {
    label: "condition",
    render: (x, y) => {
      let s = svgRect(x, y, 12, 12, { fill: BADGE_COLORS.when.fill, rx: 2 });
      s += svgText(x + 5, y + 9.5, "\u25C7", { fontSize: 7, fill: "#fff" });
      s += svgText(x + 16, y + 10, "condition (when / else)", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 160 };
    }
  },
  {
    label: "for-each",
    render: (x, y) => {
      let s = svgRect(x, y, 12, 12, { fill: BADGE_COLORS["for-each"].fill, rx: 2 });
      s += svgText(x + 4, y + 9.5, "\u21BB", { fontSize: 7, fill: "#fff" });
      s += svgText(x + 16, y + 10, "iteration (for each)", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 148 };
    }
  },
  {
    label: "slot",
    render: (x, y) => {
      let s = svgRect(x, y, 20, 12, { fill: COLORS.slot.fill, stroke: COLORS.slot.stroke, strokeWidth: 1, strokeDasharray: "3 1.5", rx: 2 });
      s += svgText(x + 24, y + 10, "slot", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 52 };
    }
  },
  {
    label: "part",
    render: (x, y) => {
      let s = svgText(x, y + 10, "part", { fontSize: 9, fill: "#424242" });
      s += svgText(x + 28, y + 10, "static part", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 92 };
    }
  },
  {
    label: "conditional part",
    render: (x, y) => {
      let s = svgText(x, y + 10, "[part]", { fontSize: 9, fill: "#888", fontStyle: "italic" });
      s += svgText(x + 40, y + 10, "conditional part", { fontSize: 8, fill: "#666" });
      return { svg: s, width: 128 };
    }
  }
];

function renderLegend(x, y, maxWidth) {
  const rowHeight = 16;
  const itemGap = 14;
  const availWidth = maxWidth - SIZES.padding * 2;
  let svg = "";

  // Separator line
  svg += `<line x1="${x}" y1="${y}" x2="${x + maxWidth - SIZES.padding * 2}" y2="${y}" stroke="#e0e0e0" stroke-width="0.5" />\n`;

  let cx = x;
  let cy = y + 8;
  let rows = 1;

  for (const item of LEGEND_ITEMS) {
    const result = item.render(cx, cy);
    // Wrap to next row if item would overflow
    if (cx - x + result.width > availWidth && cx > x) {
      cx = x;
      cy += rowHeight;
      rows++;
      const wrapped = item.render(cx, cy);
      svg += wrapped.svg;
      cx += wrapped.width + itemGap;
    } else {
      svg += result.svg;
      cx += result.width + itemGap;
    }
  }

  const totalHeight = 8 + rowHeight * rows + 4;
  return { svg, width: availWidth, height: totalHeight };
}

// ─── CLI ─────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node render-svg.mjs <layout.md> [--metadata path] [--out dir] [--component name]");
    console.log("       node render-svg.mjs --all [--out dir]");
    process.exit(0);
  }

  let layoutPath = null;
  let metadataPath = null;
  let outputDir = null;
  let all = false;
  let component = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--all") {
      all = true;
    } else if (args[i] === "--metadata" && args[i + 1]) {
      metadataPath = resolve(args[++i]);
    } else if (args[i] === "--out" && args[i + 1]) {
      outputDir = resolve(args[++i]);
    } else if (args[i] === "--component" && args[i + 1]) {
      component = args[++i];
    } else if (!args[i].startsWith("-")) {
      layoutPath = resolve(args[i]);
    }
  }

  if (all || component) {
    const srcRoot = resolve("src/components");
    const patterns = component
      ? [join(srcRoot, component, "docs", "layout.md")]
      : findAllLayouts(srcRoot);

    let total = 0;
    for (const lp of patterns) {
      if (!existsSync(lp)) continue;
      const dir = dirname(lp);
      const mp = join(dir, "layout-metadata.json");
      const meta = existsSync(mp) ? mp : null;
      try {
        const files = renderLayoutFile(lp, meta, outputDir || dir);
        total += files.length;
        console.log(`  ${basename(dirname(dir))}: ${files.length} SVG(s)`);
      } catch (err) {
        console.error(`  ${basename(dirname(dir))}: ERROR - ${err.message}`);
      }
    }
    console.log(`\nGenerated ${total} SVG file(s).`);
    return;
  }

  if (!layoutPath) {
    console.error("Error: provide a layout.md path or use --all");
    process.exit(1);
  }

  const files = renderLayoutFile(layoutPath, metadataPath, outputDir);
  console.log(`Generated: ${files.join(", ")}`);
}

function findAllLayouts(srcRoot) {
  const results = [];
  try {
    for (const entry of readdirSync(srcRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const layoutPath = join(srcRoot, entry.name, "docs", "layout.md");
        if (existsSync(layoutPath)) {
          results.push(layoutPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return results;
}

// Run CLI if executed directly
if (process.argv[1]?.endsWith("render-svg.mjs")) {
  main();
}
