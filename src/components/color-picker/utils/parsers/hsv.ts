/** Regular expression to match HSV color format */
const hsvRegex = /hsv\s*\(\s*(-?\d+)\s*,\s*(-?\d+)%\s*,\s*(-?\d+)%\s*\)/i;

/**
 * Parses an HSV color string and extracts individual H, S, V values
 * @param hsv - HSV color string (e.g., "hsv(120, 50%, 80%)")
 * @returns Object with h, s, v values, or null if parsing fails
 */
export const fromHsvStringToHsvColor = (
  hsv: string
): { h: number; s: number; v: number } | null => {
  const result = hsv.match(hsvRegex);

  if (result) {
    let h = parseInt(result[1]);
    let s = parseInt(result[2]);
    let v = parseInt(result[3]);

    // Normalize hue: any value outside 0-359 becomes 0
    if (h < 0 || h >= 360) {
      h = 0;
    }

    // Clamp saturation and value to 0-100
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    return { h, s, v };
  }

  console.warn("Parsing HSV string failed");
  return null;
};

/**
 * Parses an HSV color string and converts it to RGB
 * @param hsv - HSV color string (e.g., "hsv(120, 50%, 80%)"
 * @returns Object with r, g, b, and a values, or null if parsing fails
 */
export const fromHsvStringToRgbColor = (
  hsv: string
): { r: number; g: number; b: number } | null => {
  const result = hsv.match(hsvRegex);

  if (result) {
    let h = parseInt(result[1]);
    let s = parseInt(result[2]) / 100;
    let v = parseInt(result[3]) / 100;

    // Normalize hue: any value outside 0-359 becomes 0
    if (h < 0 || h >= 360) {
      h = 0;
    }

    s = Math.max(0, Math.min(1, s)); // Saturation 0-1
    v = Math.max(0, Math.min(1, v)); // Brightness 0-1

    // Convert HSV to RGB
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

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
      b: Math.round((b + m) * 255)
    };
  }
  console.warn("Parsing from HSV string to RGB Color failed");
  return null;
};
