/**
 * svg-primitives.mjs
 *
 * Low-level SVG string builders for the anatomy renderer.
 * All functions return raw SVG markup strings.
 */

/**
 * Escape XML special characters.
 */
export function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render a <rect> element.
 */
export function svgRect(
  x,
  y,
  width,
  height,
  { fill, stroke, strokeWidth, strokeDasharray, rx, ry, opacity, className } = {}
) {
  const attrs = [`x="${x}"`, `y="${y}"`, `width="${width}"`, `height="${height}"`];
  if (fill) attrs.push(`fill="${fill}"`);
  if (stroke) attrs.push(`stroke="${stroke}"`);
  if (strokeWidth) attrs.push(`stroke-width="${strokeWidth}"`);
  if (strokeDasharray) attrs.push(`stroke-dasharray="${strokeDasharray}"`);
  if (rx) attrs.push(`rx="${rx}"`);
  if (ry) attrs.push(`ry="${ry || rx}"`);
  if (opacity !== undefined) attrs.push(`opacity="${opacity}"`);
  if (className) attrs.push(`class="${className}"`);
  return `<rect ${attrs.join(" ")} />\n`;
}

/**
 * Render a <text> element.
 */
export function svgText(
  x,
  y,
  content,
  { fontSize, fill, fontFamily, fontStyle, fontWeight, className, anchor } = {}
) {
  const attrs = [`x="${x}"`, `y="${y}"`];
  if (fontSize) attrs.push(`font-size="${fontSize}"`);
  if (fill) attrs.push(`fill="${fill}"`);
  if (fontFamily) attrs.push(`font-family="${fontFamily}"`);
  if (fontStyle) attrs.push(`font-style="${fontStyle}"`);
  if (fontWeight) attrs.push(`font-weight="${fontWeight}"`);
  if (className) attrs.push(`class="${className}"`);
  if (anchor) attrs.push(`text-anchor="${anchor}"`);
  return `<text ${attrs.join(" ")}>${esc(content)}</text>\n`;
}

/**
 * Render a <g> (group) with optional transform.
 */
export function svgGroup(content, { transform, className, title } = {}) {
  const attrs = [];
  if (transform) attrs.push(`transform="${transform}"`);
  if (className) attrs.push(`class="${className}"`);

  let inner = "";
  if (title) {
    inner += `<title>${esc(title)}</title>\n`;
  }
  inner += content;

  return `<g ${attrs.join(" ")}>\n${inner}</g>\n`;
}

/**
 * Render a badge (small rounded rect with centered text).
 */
export function svgBadge(
  x,
  y,
  text,
  { bgColor, textColor, fontSize = 9, paddingX = 6, height = 18, rx = 3 } = {}
) {
  const textWidth = text.length * fontSize * 0.6;
  const width = textWidth + paddingX * 2;

  let svg = svgRect(x, y, width, height, { fill: bgColor, rx });
  svg += svgText(x + width / 2, y + height / 2 + fontSize * 0.35, text, {
    fontSize,
    fill: textColor,
    fontFamily: "monospace",
    anchor: "middle"
  });

  return svg;
}

/**
 * Render a dashed rectangle (for shadow root boundaries).
 */
export function svgDashedRect(x, y, width, height, { stroke, label } = {}) {
  let svg = svgRect(x, y, width, height, {
    fill: "none",
    stroke: stroke || "#9e9e9e",
    strokeWidth: 1.5,
    strokeDasharray: "6 3",
    rx: 3
  });

  if (label) {
    // Small label at the top-left corner of the dashed rect
    const labelWidth = label.length * 5.5 + 8;
    svg += svgRect(x + 4, y - 6, labelWidth, 12, {
      fill: "#ffffff",
      rx: 2
    });
    svg += svgText(x + 8, y + 2, label, {
      fontSize: 8,
      fill: "#9e9e9e",
      fontFamily: "monospace"
    });
  }

  return svg;
}

/**
 * Wrap content in a full SVG document with embedded styles.
 */
export function svgDocument(content, width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${width} ${height}"
     width="${width}" height="${height}"
     font-family="monospace, Consolas">
  <style>
    text { dominant-baseline: auto; }
  </style>
  ${content}
</svg>
`;
}
