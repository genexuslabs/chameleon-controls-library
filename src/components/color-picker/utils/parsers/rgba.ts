/** Regular expression to match RGB/RGBA color format */
const rgbaRegex =
  /rgba?\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*(?:,\s*(-?\d*\.?\d*)\s*)?\)/i;

/**
 * Parses an RGB/RGBA color string and returns color components
 * @param color - RGB or RGBA color string (e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
 * @returns Object with r, g, b, and a (alpha) values, or null if parsing fails
 */
export const fromRgbaStringToRgbaColor = (
  color: string
): { r: number; g: number; b: number; a: number } | null => {
  const result = color.match(rgbaRegex);
  if (result) {
    let r = parseInt(result[1]);
    let g = parseInt(result[2]);
    let b = parseInt(result[3]);
    let a = result[4] ? parseFloat(result[4]) : 1; // Alpha set to 1 if not provided
    if (isNaN(a)) {
      console.warn("Parsing from RGBA string to RGBA Color failed");
      return null;
    }

    // Clamp RGB values to 0-255
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Clamp alpha to 0-1
    a = Math.max(0, Math.min(1, a));

    return { r, g, b, a };
  }
  console.warn("Parsing from RGBA string to RGBA Color failed");
  return null;
};
