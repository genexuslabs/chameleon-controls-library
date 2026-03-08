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

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  BADGE_COLORS,
  COLORS,
  CONTAINER_FILLS,
  SIZES,
  defaultHints,
  inferStyle
} from "./defaults.mjs";
import { parseLayoutFile } from "./parse-layout.mjs";
import {
  BADGE_ICONS,
  svgBadge,
  svgDashedRect,
  svgDocument,
  svgRect,
  svgText
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
  const metadata =
    metadataPath && existsSync(metadataPath)
      ? JSON.parse(readFileSync(metadataPath, "utf-8"))
      : null;

  const generatedFiles = [];

  for (const layoutCase of cases) {
    const caseMeta =
      metadata?.cases?.find(c => c.case === layoutCase.case) || null;
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

  const legendGap = 16;
  const legendX = diagramWidth + legendGap;
  const legend = renderLegend(legendX, SIZES.padding);

  const totalWidth = legendX + legend.width + SIZES.padding;
  const totalHeight = Math.max(diagramHeight, legend.height + SIZES.padding * 2);

  const content = renderNode(positioned) + legend.svg;
  return svgDocument(content, totalWidth, totalHeight);
}

// ─── Phase 1: Measure (bottom-up) ────────────────────────────────────────

function measure(node, caseMeta, path) {
  const hints = getHints(node, caseMeta, path);

  // Skip hidden nodes
  if (hints.hidden) {
    return {
      width: 0,
      height: 0,
      label: { primary: "", width: 0, height: 0 },
      childMeasurements: [],
      hints,
      path
    };
  }

  const label = computeLabel(node);

  // Comment nodes and text nodes are rendered as inline badges/labels, not boxes
  if (isCommentNode(node)) {
    return {
      width: label.width,
      height: label.height,
      label,
      childMeasurements: [],
      hints,
      direction: "column",
      path
    };
  }
  if (node.type === "text") {
    return {
      width: label.width,
      height: label.height,
      label,
      childMeasurements: [],
      hints,
      direction: "column",
      path
    };
  }

  const visibleChildren = getVisibleChildren(node);
  const direction = hints.direction || "column";

  // Leaf element (no children)
  if (visibleChildren.length === 0) {
    const w = Math.max(label.width + SIZES.padding * 2, SIZES.minWidth);
    const h = Math.max(label.height + SIZES.padding * 2, SIZES.minHeight);
    return {
      width: w,
      height: h,
      label,
      childMeasurements: [],
      hints,
      direction,
      path
    };
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

  // Split shadow vs projected children
  const hasShadow = node.shadowRoot;
  const shadowMeasurements = hasShadow
    ? visibleMeasurements.filter(c => !isProjectedChild(node, c.node))
    : visibleMeasurements;
  const projectedMeasurements = hasShadow
    ? visibleMeasurements.filter(c => isProjectedChild(node, c.node))
    : [];

  function measureGroup(group) {
    if (group.length === 0) return { width: 0, height: 0 };
    const hasConditions = group.some(c => isCommentNode(c.node));
    const condIndentW = hasConditions ? SIZES.condIndent : 0;
    if (direction === "row") {
      return {
        width: group.reduce((sum, c) => sum + c.width, 0) +
          Math.max(0, group.length - 1) * SIZES.gap,
        height: Math.max(0, ...group.map(c => c.height))
      };
    }
    const badgeWidths = group.filter(c => isCommentNode(c.node)).map(c => c.width);
    const contentWidths = group.filter(c => !isCommentNode(c.node)).map(c => c.width + condIndentW);
    return {
      width: Math.max(0, ...badgeWidths, ...contentWidths),
      height: computeColumnHeight(group)
    };
  }

  const shadowContent = measureGroup(shadowMeasurements);
  const projectedContent = measureGroup(projectedMeasurements);

  const labelSpace = label.height > 0 ? label.height + SIZES.labelGap : 0;

  // Shadow boundary adds extra spacing (margin for dashed border + padding for children)
  const extraInline = hasShadow ? SIZES.shadowMarginX + SIZES.shadowPadX : 0;
  const extraPadY = hasShadow ? SIZES.shadowPadY : 0;
  const shadowLabelExtra = hasShadow ? SIZES.shadowLabelGap : 0;

  // First shadow child's floating pill needs extra top space
  const firstShadowPillSpace =
    shadowMeasurements.length > 0 &&
    hasFloatingPill(shadowMeasurements[0].node)
      ? SIZES.tagFloat
      : 0;

  // First projected child's floating pill needs extra top space
  const firstProjPillSpace =
    projectedMeasurements.length > 0 &&
    hasFloatingPill(projectedMeasurements[0].node)
      ? SIZES.tagFloat
      : 0;

  // Projected section adds: separator gap + projected label + content
  const projectedSectionHeight = projectedMeasurements.length > 0
    ? SIZES.gap + SIZES.badgeHeight + SIZES.commentGap + firstProjPillSpace + projectedContent.height
    : 0;

  const contentWidth = Math.max(shadowContent.width, projectedContent.width);

  const width = Math.max(
    label.width + SIZES.padding * 2,
    contentWidth + SIZES.padding * 2 + extraInline * 2,
    SIZES.minWidth
  );
  const height = Math.max(
    SIZES.padding +
      labelSpace +
      firstShadowPillSpace +
      shadowContent.height +
      SIZES.padding +
      extraPadY +
      shadowLabelExtra +
      projectedSectionHeight,
    SIZES.minHeight
  );

  return {
    width, height, label, childMeasurements, hints, direction, path,
    shadowMeasurements, projectedMeasurements,
    shadowContentHeight: shadowContent.height
  };
}

// ─── Phase 2: Position (top-down) ────────────────────────────────────────

function positionGroup(group, cx, cy, direction, result, containerDepth) {
  const hasConditions = group.some(c => isCommentNode(c.node));
  const condIndent = hasConditions ? SIZES.condIndent : 0;
  let inCondScope = false;
  let currentScope = null;
  let lastContentBottomY = cy;

  for (let i = 0; i < group.length; i++) {
    const childMeasure = group[i];
    const childNode = childMeasure.node;

    if (direction === "row") {
      const childPos = position(childNode, childMeasure, cx, cy, containerDepth);
      result.children.push(childPos);
      cx += childMeasure.width + SIZES.gap;
    } else {
      if (isCommentNode(childNode)) {
        if (currentScope) {
          const isContinuation =
            childNode.type === "comment-else" ||
            childNode.type === "comment-else-when";
          currentScope.endY = isContinuation
            ? cy - SIZES.commentGap
            : lastContentBottomY;
          result.condScopes.push(currentScope);
        }
        const childPos = position(childNode, childMeasure, cx, cy, containerDepth);
        result.children.push(childPos);
        const scopeColor = getScopeColor(childNode);
        currentScope = {
          startY: cy + childMeasure.height,
          endY: cy + childMeasure.height,
          x: cx + condIndent - 4,
          color: scopeColor
        };
        inCondScope = true;
      } else {
        const childCx = inCondScope ? cx + condIndent : cx;
        const childPos = position(childNode, childMeasure, childCx, cy, containerDepth);
        result.children.push(childPos);
        lastContentBottomY = cy + childMeasure.height;
        if (currentScope) {
          currentScope.endY = lastContentBottomY;
        }

        // Close scope if next node is not a continuation (else/else-when)
        const nextNode = group[i + 1]?.node;
        if (inCondScope && currentScope && (!nextNode || !isCommentNode(nextNode) ||
            (nextNode.type !== "comment-else" && nextNode.type !== "comment-else-when"))) {
          result.condScopes.push(currentScope);
          currentScope = null;
          inCondScope = false;
        }
      }

      const gap = gapAfterChild(childMeasure, group[i + 1]);
      cy += childMeasure.height + gap;
    }
  }

  if (currentScope && currentScope.endY > currentScope.startY) {
    result.condScopes.push(currentScope);
  }

  return cy;
}

function position(node, measurement, x, y, containerDepth = 0) {
  const { label, hints, direction, path,
    shadowMeasurements, projectedMeasurements } = measurement;

  // Track container nesting depth for alternating fill colors
  const style = hints?.style || inferStyle(node);
  const isContainer = style === "container";
  const myContainerDepth = isContainer ? containerDepth : containerDepth;
  const childContainerDepth = isContainer ? containerDepth + 1 : containerDepth;

  const result = {
    node,
    x,
    y,
    width: measurement.width,
    height: measurement.height,
    label,
    hints,
    path,
    children: [],
    containerDepth: myContainerDepth
  };

  const labelSpace = label.height > 0 ? label.height + SIZES.labelGap : 0;
  const extraInline = node.shadowRoot ? SIZES.shadowMarginX + SIZES.shadowPadX : 0;

  let cx = x + SIZES.padding + extraInline;
  let cy = y + SIZES.padding + labelSpace;

  if (node.shadowRoot) {
    cy += SIZES.shadowPadY + SIZES.shadowLabelGap;
  }

  result.condScopes = [];

  // --- Shadow children ---
  const shadowGroup = shadowMeasurements || [];
  if (shadowGroup.length > 0) {
    if (hasFloatingPill(shadowGroup[0].node)) {
      cy += SIZES.tagFloat;
    }
    cy = positionGroup(shadowGroup, cx, cy, direction, result, childContainerDepth);
  }

  // --- Projected children (light DOM) ---
  const projGroup = projectedMeasurements || [];
  if (projGroup.length > 0) {
    // Record where the projected section starts for rendering
    cy += SIZES.gap;
    result.projectedLabelY = cy;
    cy += SIZES.badgeHeight + SIZES.commentGap;

    // Reset cx to component padding (no shadow extraPad for projected content)
    const projCx = x + SIZES.padding;
    if (hasFloatingPill(projGroup[0].node)) {
      cy += SIZES.tagFloat;
    }
    cy = positionGroup(projGroup, projCx, cy, direction, result, childContainerDepth);
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
  const baseColors = COLORS[style] || COLORS.container;

  // Alternate container fill by visual nesting depth so nested components are distinguishable
  const colors = style === "container"
    ? { ...baseColors, fill: CONTAINER_FILLS[(positioned.containerDepth ?? 0) % CONTAINER_FILLS.length] }
    : baseColors;

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
    svg += svgText(
      pillX + SIZES.tagPillPadX,
      pillY + pillH - 3,
      label.tagText,
      {
        fontSize: SIZES.tagFontSize,
        fill: colors.text,
        fontWeight: "bold"
      }
    );
  }

  // Shadow root boundary (sized to only cover shadow children, not projected)
  if (node.shadowRoot) {
    const shadowY = y + SIZES.padding + label.height + SIZES.labelGap;

    // If there are projected children, shadow boundary only covers shadow content
    const hasProjected = positioned.projectedLabelY != null;
    const shadowHeight = hasProjected
      ? positioned.projectedLabelY - shadowY - SIZES.gap / 2
      : height - SIZES.padding - label.height - SIZES.labelGap - SIZES.shadowPadY / 2;

    svg += svgDashedRect(
      x + SIZES.shadowMarginX,
      shadowY,
      width - SIZES.shadowMarginX * 2,
      shadowHeight,
      { stroke: COLORS.shadow.stroke, label: "#shadow-root" }
    );

    // Projected content label
    if (hasProjected) {
      const projLabelY = positioned.projectedLabelY;
      svg += svgBadge(
        x + SIZES.padding,
        projLabelY,
        "projected content (light DOM)",
        { bgColor: BADGE_COLORS.projected.fill, textColor: BADGE_COLORS.projected.text, height: SIZES.badgeHeight, paddingX: SIZES.badgePadX, rx: SIZES.badgeRadius, icon: BADGE_ICONS.projected }
      );
    }
  }

  // Internal labels
  let labelY = y + SIZES.padding;

  // Inline tag for slots (rendered inside the box, not as floating pill)
  if (label.inlineTag) {
    svg += svgText(
      x + SIZES.padding - 4,
      labelY + SIZES.tagFontSize,
      label.inlineTag,
      {
        fontSize: SIZES.tagFontSize,
        fill: colors.text,
        fontWeight: "bold"
      }
    );
    labelY += SIZES.tagFontSize + 2;
  }

  // Static part names
  if (label.primary) {
    svg += svgText(
      x + SIZES.padding,
      labelY + SIZES.partFontSize,
      label.primary,
      {
        fontSize: SIZES.partFontSize,
        fill: "#666"
      }
    );
    labelY += SIZES.partFontSize + 2;
  }

  // Conditional/dynamic parts (same size, italic)
  if (label.conditional) {
    svg += svgText(
      x + SIZES.padding,
      labelY + SIZES.partFontSize,
      label.conditional,
      {
        fontSize: SIZES.partFontSize,
        fill: "#666",
        fontStyle: "italic"
      }
    );
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

  let badgeColor, text, icon;

  switch (node.type) {
    case "comment-when":
      badgeColor = BADGE_COLORS.when;
      icon = BADGE_ICONS.condition;
      text = `when ${node.condition}`;
      break;
    case "comment-else":
      badgeColor = BADGE_COLORS.else;
      icon = BADGE_ICONS.condition;
      text = node.description
        ? `else (${node.description})`
        : "else";
      break;
    case "comment-else-when":
      badgeColor = BADGE_COLORS.else;
      icon = BADGE_ICONS.condition;
      text = `else when ${node.condition}`;
      break;
    case "comment-for-each":
      badgeColor = BADGE_COLORS["for-each"];
      icon = BADGE_ICONS.iteration;
      text = `for each ${node.iteration.item} in ${node.iteration.collection}`;
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
    icon,
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
    const truncated =
      text.length > 60 ? text.substring(0, 59) + "\u2026" : text;
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
  const primary =
    staticParts.length > 0 ? staticParts.map(p => p.name).join(" ") : "";

  // Tag name: floating pill for most elements, inline for slots
  const isSlotNode = node.type === "slot";
  const slotName = isSlotNode && node.attributes?.name ? node.attributes.name : null;

  // Slot assignment integrated into the tag pill (e.g. <div slot="header">)
  const slotAssignment = !isSlotNode && node.attributes?.slot
    ? ` slot="${node.attributes.slot}"`
    : "";
  const tagRaw = slotName
    ? `<slot name="${slotName}">`
    : `<${tag}${slotAssignment}>`;
  const tagText = isSlotNode ? null : tagRaw;
  const tagWidth = isSlotNode
    ? 0
    : Math.ceil(tagRaw.length * SIZES.charWidth * 0.85 + SIZES.tagPillPadX * 2);

  // Conditional line
  const conditional =
    condParts.length > 0
      ? condParts
          .map(p => {
            if (p.dynamic && p.conditional) return `[{${p.name}}]`;
            if (p.dynamic) return `{${p.name}}`;
            if (p.exclusive) return `[${p.exclusive.join("|")}]`;
            return `[${p.name}]`;
          })
          .join(" ")
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
    totalHeight += SIZES.partFontSize + 2;
  }

  return {
    primary,
    tagText,
    tagWidth,
    inlineTag: isSlotNode ? tagRaw : null,
    conditional,
    parts,
    width: maxWidth,
    height: totalHeight
  };
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
 * Check if a child node is projected (light DOM) content of a shadow host.
 * Projected children have the same or lower shadowDepth as the parent.
 */
function isProjectedChild(parentNode, childNode) {
  if (!parentNode.shadowRoot) return false;
  const childDepth = childNode.shadowDepth ?? 0;
  return childDepth <= (parentNode.shadowDepth ?? 0);
}

/**
 * Compute the gap after a child in a column layout.
 * Comments use a tiny gap so they stick to the element they annotate.
 */
function hasFloatingPill(node) {
  return (
    node.tag &&
    node.type !== "slot" &&
    node.type !== "text" &&
    !isCommentNode(node)
  );
}

function isNewConditionGroup(node) {
  return node.type === "comment-when" || node.type === "comment-for-each";
}

function gapAfterChild(currentMeasure, nextMeasure) {
  if (!nextMeasure) return 0;
  const pillMargin = hasFloatingPill(nextMeasure.node) ? SIZES.tagFloat : 0;
  // Comment followed by anything: tiny gap (badge sticks to next element)
  if (isCommentNode(currentMeasure.node)) return SIZES.commentGap + pillMargin;
  // Content followed by a new independent condition group: extra separation
  if (isNewConditionGroup(nextMeasure.node)) return SIZES.gap * 2 + pillMargin;
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

// Render an icon path in the legend (white color on colored background)
function legendIcon(icon, x, y, size) {
  const scale = size / icon.viewBox;
  if (icon.type === "fill") {
    return `<path d="${icon.path}" fill="#fff" transform="translate(${x},${y}) scale(${scale})" />\n`;
  }
  return `<path d="${icon.path}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x},${y}) scale(${scale})" />\n`;
}

// Each legend item has a preview (icon/swatch) and a label, rendered in two aligned columns
const LEGEND_ITEMS = [
  {
    label: "#shadow-root",
    preview: (x, y) => {
      return `<line x1="${x}" y1="${y + 6}" x2="${x + 24}" y2="${y + 6}" stroke="#9e9e9e" stroke-width="1.5" stroke-dasharray="4 2" />\n`;
    }
  },
  {
    label: "condition (when / else)",
    preview: (x, y) => {
      let s = svgRect(x, y, 12, 12, { fill: BADGE_COLORS.when.fill, rx: 2 });
      s += legendIcon(BADGE_ICONS.condition, x + 1, y + 1, 10);
      return s;
    }
  },
  {
    label: "iteration (for each)",
    preview: (x, y) => {
      let s = svgRect(x, y, 12, 12, { fill: BADGE_COLORS["for-each"].fill, rx: 2 });
      s += legendIcon(BADGE_ICONS.iteration, x + 1, y + 1, 10);
      return s;
    }
  },
  {
    label: "descriptive comment",
    preview: (x, y) => {
      return svgRect(x, y, 12, 12, { fill: BADGE_COLORS.descriptive.fill, rx: 2 });
    }
  },
  {
    label: "slot",
    preview: (x, y) => {
      return svgRect(x, y, 20, 12, {
        fill: COLORS.slot.fill,
        stroke: COLORS.slot.stroke,
        strokeWidth: 1,
        strokeDasharray: "3 1.5",
        rx: 2
      });
    }
  },
  {
    label: "projected content (light DOM)",
    preview: (x, y) => {
      let s = svgRect(x, y, 12, 12, { fill: BADGE_COLORS.projected.fill, rx: 2 });
      s += legendIcon(BADGE_ICONS.projected, x + 1, y + 1, 10);
      return s;
    }
  },
  {
    label: "static part",
    preview: (x, y) => {
      return svgText(x, y + 10, "part", { fontSize: 9, fill: "#666" });
    }
  },
  {
    label: "conditional part",
    preview: (x, y) => {
      return svgText(x, y + 10, "[part]", { fontSize: 9, fill: "#666", fontStyle: "italic" });
    }
  },
  {
    label: "dynamic part",
    preview: (x, y) => {
      return svgText(x, y + 10, "{part}", { fontSize: 9, fill: "#666", fontStyle: "italic" });
    }
  },
  {
    label: "conditional dynamic part",
    preview: (x, y) => {
      return svgText(x, y + 10, "[{part}]", { fontSize: 9, fill: "#666", fontStyle: "italic" });
    }
  }
];

function renderLegend(x, y) {
  const rowHeight = 16;
  const paddingX = 10;
  const paddingY = 8;
  const titleHeight = 14;
  const labelX = 46; // Fixed x offset for all labels, aligned after the widest preview ([{part}])

  // Title "Legend"
  let svg = svgText(x + paddingX, y + titleHeight, "Legend", {
    fontSize: 10,
    fill: "#424242",
    fontWeight: "bold"
  });

  let cy = y + titleHeight + paddingY;
  let maxLabelWidth = 0;

  for (const item of LEGEND_ITEMS) {
    svg += item.preview(x + paddingX, cy);
    svg += svgText(x + paddingX + labelX, cy + 10, item.label, {
      fontSize: 8,
      fill: "#666"
    });
    maxLabelWidth = Math.max(maxLabelWidth, item.label.length * 5);
    cy += rowHeight;
  }

  const totalWidth = paddingX + labelX + maxLabelWidth + paddingX;
  const totalHeight = cy - y + paddingY;

  // Border around the legend
  const border = svgRect(x, y, totalWidth, totalHeight, {
    fill: "none",
    stroke: "#bdbdbd",
    strokeWidth: 1,
    rx: 4
  });

  return { svg: border + svg, width: totalWidth, height: totalHeight };
}

// ─── CLI ─────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node render-svg.mjs <layout.md> [--metadata path] [--out dir] [--component name]"
    );
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
