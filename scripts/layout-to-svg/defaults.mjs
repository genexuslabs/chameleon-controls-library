/**
 * defaults.mjs
 *
 * Default visual configuration for the SVG anatomy renderer.
 * Used when no metadata.json is available.
 */

// ─── Sizing ──────────────────────────────────────────────────────────────

export const SIZES = {
  charWidth: 6.5, // monospace ~10px
  lineHeight: 14,
  tagFontSize: 9,
  partFontSize: 9,
  condFontSize: 9,
  padding: 10,
  gap: 6,
  commentGap: 1, // Minimal gap between a comment badge and the element it annotates
  condIndent: 12, // Horizontal indent for content inside a condition scope
  tagPillHeight: 12, // Height of the floating tag pill (single-line)
  tagPillPadX: 4, // Horizontal padding inside the tag pill
  tagFloat: 6, // How many px the tag pill extends above the box top edge
  pillLineHeight: 12, // Baseline-to-baseline inside multi-line tag pills
  maxTagChars: 60, // Character threshold before multi-line wrapping
  labelGap: 0, // Legacy: was gap between label lines and children, now handled by pill overlap
  minWidth: 50,
  minHeight: 24,
  shadowMarginX: 2, // Inline margin between parent container border and dashed shadow boundary
  shadowPadX: 0, // Extra inline padding inside the dashed shadow boundary for children
  shadowPadY: 4, // Extra block breathing room between dashed boundary and inner boxes
  shadowLabelGap: 4, // Extra space after #shadow-root label before children
  badgeHeight: 16,
  badgePadX: 6,
  badgeRadius: 3
};

// ─── Colors ──────────────────────────────────────────────────────────────

export const COLORS = {
  container: { fill: "#fafafa", stroke: "#bdbdbd", text: "#424242" },
  interactive: { fill: "#e3f2fd", stroke: "#1976d2", text: "#0d47a1" },
  slot: { fill: "#fff8e1", stroke: "#f57f17", text: "#e65100" },
  text: { fill: "none", stroke: "none", text: "#616161" },
  decorative: { fill: "#e8f5e9", stroke: "#388e3c", text: "#1b5e20" },
  host: { fill: "#ffffff", stroke: "#424242", text: "#212121" },
  shadow: { fill: "rgba(0,0,0,0.02)", stroke: "#9e9e9e" }
};

export const BADGE_COLORS = {
  when: { fill: "#7b1fa2", text: "#ffffff" },
  else: { fill: "#ad1457", text: "#ffffff" },
  "for-each": { fill: "#00695c", text: "#ffffff" },
  descriptive: { fill: "#546e7a", text: "#ffffff" },
  projected: { fill: "#0277bd", text: "#ffffff" }
};

// Shadow depth background tints (progressively darker)
export const SHADOW_TINTS = [
  "rgba(0,0,0,0)", // depth 0: transparent
  "rgba(0,0,0,0.015)", // depth 1
  "rgba(0,0,0,0.030)", // depth 2
  "rgba(0,0,0,0.045)", // depth 3
  "rgba(0,0,0,0.060)" // depth 4
];

// Alternating container fills by shadow depth (cycles every 4 levels)
// All colors are light enough to contrast well with #888 and #424242 text
export const CONTAINER_FILLS = [
  "#fafafa", // depth 0: neutral gray
  "#f3f0ff", // depth 1: light lavender
  "#f0f7f4", // depth 2: light mint
  "#fff8f0"  // depth 3: light peach
];

// ─── Style inference ─────────────────────────────────────────────────────

const INTERACTIVE_TAGS = new Set([
  "button",
  "input",
  "a",
  "select",
  "textarea"
]);
const DECORATIVE_TAGS = new Set(["hr", "img", "canvas"]);

/**
 * Infer visual style from a node's tag and attributes.
 * @param {object} node - AST node
 * @returns {"container"|"interactive"|"text"|"decorative"|"slot"|"host"}
 */
export function inferStyle(node) {
  if (!node) return "container";

  if (node.type === "slot") return "slot";
  if (node.type === "text") return "text";

  const tag = node.tag || "";

  // Host element (shadow depth 0, custom element)
  if (node.shadowDepth === 0 && tag.includes("-")) return "host";

  if (INTERACTIVE_TAGS.has(tag)) return "interactive";
  if (DECORATIVE_TAGS.has(tag)) return "decorative";

  return "container";
}

/**
 * Return default visual hints for a node.
 * @param {object} node
 * @returns {import('./types').NodeVisualHints}
 */
export function defaultHints(node) {
  return {
    direction: "column",
    position: "flow",
    style: inferStyle(node)
  };
}
