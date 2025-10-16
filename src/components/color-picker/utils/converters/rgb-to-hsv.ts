/**
 * Converts RGB values to HSV color space
 * @param color - Array containing [r, g, b] values (0-255)
 * @returns Array with [h, s, v] values (h: 0-360, s: 0-100, v: 0-100), or null if invalid input
 */
export const fromRgbToHsv = (
  color: [number, number, number]
): { h: number; s: number; v: number } | null => {
  // Validate input
  if (!Array.isArray(color) || color.length !== 3) {
    console.warn("RGB to HSV conversion failed: Invalid array length");
    return null;
  }

  const [r, g, b] = color;

  // Validate that all values are numbers
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
    console.warn("RGB to HSV conversion failed: Invalid RGB value types");
    return null;
  }

  // Check for NaN values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn("RGB to HSV conversion failed: NaN values detected");
    return null;
  }

  // Clamp RGB values to 0-255 and normalize to 0-1
  const normalizedR = Math.max(0, Math.min(255, Math.round(r))) / 255;
  const normalizedG = Math.max(0, Math.min(255, Math.round(g))) / 255;
  const normalizedB = Math.max(0, Math.min(255, Math.round(b))) / 255;

  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  let h = 0;
  let s = 0;
  const v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case normalizedR:
        h =
          (normalizedG - normalizedB) / d + (normalizedG < normalizedB ? 6 : 0);
        break;
      case normalizedG:
        h = (normalizedB - normalizedR) / d + 2;
        break;
      case normalizedB:
        h = (normalizedR - normalizedG) / d + 4;
        break;
      default:
        h = 0; // fallback
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
};
