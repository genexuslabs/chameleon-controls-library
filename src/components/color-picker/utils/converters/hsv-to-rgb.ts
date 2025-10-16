/**
 * Converts HSV values to RGB color space
 * @param h - Hue component (0-360)
 * @param s - Saturation component (0-100)
 * @param v - Value component (0-100)
 * @returns Array with [r, g, b] values (0-255), or null if invalid input
 */
export const fromHsvToRgb = (
  h: number,
  s: number,
  v: number
): [number, number, number] | null => {
  // Validate input types
  if (typeof h !== "number" || typeof s !== "number" || typeof v !== "number") {
    console.warn("HSV to RGB conversion failed: Invalid input types");
    return null;
  }

  // Check for NaN values
  if (isNaN(h) || isNaN(s) || isNaN(v)) {
    console.warn("HSV to RGB conversion failed: NaN values detected");
    return null;
  }

  // Clamp values to valid ranges
  h = h % 360; // Hue wraps around
  if (h < 0) {
    h += 360;
  }
  s = Math.max(0, Math.min(100, s)); // Saturation 0-100
  v = Math.max(0, Math.min(100, v)); // Value 0-100

  // Normalize to 0-1 range
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r: number, g: number, b: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0; // Fallback
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
