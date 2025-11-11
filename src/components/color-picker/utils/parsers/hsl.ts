/** Regular expression to match HSL color format (without alpha) */
const hslRegex = /hsl\s*\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*\)/i;

/** Regular expression to match HSL/HSLA color format */
const hslaRegex =
  /hsla?\s*\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*(?:,\s*(-?\d*\.?\d*)\s*)?\)/i;

/**
 * Parses an HSL color string and returns HSL components
 * @param hsl - HSL color string (e.g., "hsl(120, 50%, 50%)")
 * @returns Object with h, s, and l values, or null if parsing fails
 */
export const fromHslStringToHslColor = (
  hsl: string
): { h: number; s: number; l: number } | null => {
  const result = hsl.match(hslRegex);

  if (result) {
    let h = parseInt(result[1]);
    let s = parseInt(result[2]);
    let l = parseInt(result[3]);

    // Normalize hue: any value outside 0-359 becomes 0
    if (h < 0 || h >= 360) {
      h = 0;
    }

    s = Math.max(0, Math.min(100, s)); // Saturation 0-100%
    l = Math.max(0, Math.min(100, l)); // Lightness 0-100%

    return { h, s, l };
  }
  console.warn("Parsing from HSL string to HSL Color failed");
  return null;
};

/**
 * Parses an HSL/HSLA color string and converts it to RGB values
 * @param hsl - HSL or HSLA color string (e.g., "hsl(120, 50%, 50%)" or "hsla(120, 50%, 50%, 0.8)")
 * @returns Object with r, g, b, and a values, or null if parsing fails
 */
export const fromHslStringToRgbaColor = (
  hsl: string
): { r: number; g: number; b: number; a: number } | null => {
  const result = hsl.match(hslaRegex);

  if (result) {
    let h = parseInt(result[1]);
    let s = parseInt(result[2]) / 100;
    let l = parseInt(result[3]) / 100;

    // Handle alpha
    let a = 1; // Default alpha
    if (result[4] !== undefined && result[4] !== "") {
      a = parseFloat(result[4]);
      if (isNaN(a)) {
        console.warn("Parsing from HSLA string to RGBA Color failed");
        return null;
      }
    }

    // Normalize hue: any value outside 0-359 becomes 0
    if (h < 0 || h >= 360) {
      h = 0;
    }

    s = Math.max(0, Math.min(1, s)); // Saturation 0-1
    l = Math.max(0, Math.min(1, l)); // Lightness 0-1
    a = Math.max(0, Math.min(1, a)); // Alpha 0-1

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r: number, g: number, b: number;
    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a
    };
  }
  console.warn("Parsing from HSLA string to RGBA Color failed");
  return null;
};
