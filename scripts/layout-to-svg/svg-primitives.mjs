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

// SVG path icons for badges (rendered as paths for cross-platform consistency)
export const BADGE_ICONS = {
  // Diamond for conditions (10×10 viewBox, stroked)
  condition: {
    path: "M5 0.5 L9.5 5 L5 9.5 L0.5 5 Z",
    viewBox: 10,
    type: "stroke"
  },
  // Circular arrow for iteration (16×16 viewBox, filled)
  iteration: {
    path: "M8 14.667a5.806 5.806 0 0 1-2.342-.475 6.1 6.1 0 0 1-1.9-1.284 6.097 6.097 0 0 1-1.283-1.9A5.804 5.804 0 0 1 2 8.667a5.8 5.8 0 0 1 .475-2.342 6.099 6.099 0 0 1 1.283-1.9 6.099 6.099 0 0 1 1.9-1.283A5.805 5.805 0 0 1 8 2.667h.1L7.533 2.1a.622.622 0 0 1-.183-.458.68.68 0 0 1 .183-.475.68.68 0 0 1 .475-.209.62.62 0 0 1 .475.192L10.2 2.867a.632.632 0 0 1 .183.466.632.632 0 0 1-.183.467L8.483 5.517a.62.62 0 0 1-.475.191.68.68 0 0 1-.475-.208.68.68 0 0 1-.183-.475c0-.183.061-.336.183-.458L8.1 4H8c-1.3 0-2.403.453-3.308 1.358-.906.906-1.359 2.009-1.359 3.309 0 1.3.453 2.402 1.359 3.308.905.906 2.008 1.358 3.308 1.358 1.178 0 2.206-.383 3.083-1.15.878-.766 1.395-1.733 1.55-2.9a.68.68 0 0 1 .234-.441.687.687 0 0 1 .466-.175c.178 0 .334.055.467.166a.44.44 0 0 1 .167.417c-.156 1.544-.8 2.833-1.934 3.867C10.9 14.15 9.556 14.667 8 14.667Z",
    viewBox: 16,
    type: "fill"
  },
  // Right arrow for projected content (16×16 viewBox, filled)
  projected: {
    path: "M10.817 8.664H3.642a.613.613 0 0 1-.457-.19.647.647 0 0 1-.185-.47c0-.187.062-.343.185-.47a.613.613 0 0 1 .457-.19h7.175l-3.146-3.23a.613.613 0 0 1-.185-.462.668.668 0 0 1 .65-.651.58.58 0 0 1 .45.189l4.237 4.353c.065.066.11.137.137.214a.75.75 0 0 1 .04.247.75.75 0 0 1-.04.248.581.581 0 0 1-.137.214l-4.237 4.353a.59.59 0 0 1-.442.181.645.645 0 0 1-.457-.181.65.65 0 0 1-.193-.47.65.65 0 0 1 .193-.47l3.13-3.215Z",
    viewBox: 16,
    type: "fill"
  }
};

/**
 * Render an SVG path icon at a given position and size.
 */
function renderIcon(icon, x, y, size, color) {
  const scale = size / icon.viewBox;
  if (icon.type === "fill") {
    return `<path d="${icon.path}" fill="${color}" transform="translate(${x},${y}) scale(${scale})" />\n`;
  }
  return `<path d="${icon.path}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x},${y}) scale(${scale})" />\n`;
}

/**
 * Render a badge (small rounded rect with centered text, optional SVG icon).
 */
export function svgBadge(
  x,
  y,
  text,
  { bgColor, textColor, fontSize = 9, paddingX = 6, height = 18, rx = 3, icon } = {}
) {
  const iconSpace = icon ? 14 : 0;
  const textWidth = text.length * fontSize * 0.6;
  const width = textWidth + iconSpace + paddingX * 2;

  let svg = svgRect(x, y, width, height, { fill: bgColor, rx });

  if (icon) {
    const iconSize = 10;
    const iconX = x + paddingX + (iconSize) / 2 - iconSize / 2;
    const iconY = y + (height - iconSize) / 2;
    svg += renderIcon(icon, iconX, iconY, iconSize, textColor);
  }

  const textX = x + paddingX + iconSpace + textWidth / 2;
  svg += svgText(textX, y + height / 2 + fontSize * 0.35, text, {
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
    const labelWidth = label.length * 5 + 6;
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
