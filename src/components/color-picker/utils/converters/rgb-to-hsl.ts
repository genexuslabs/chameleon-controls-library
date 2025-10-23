/**
 * Converts RGB/RGBA values to HSL/HSLA color format
 * @param color - Array containing [r, g, b] or [r, g, b, a] values (0-255 for RGB, 0-1 for alpha)
 * @returns HSL/HSLA color string, or null if invalid input
 */
export const fromRgbToHsl = (
  color: [number, number, number] | [number, number, number, number]
): string | null => {
  // Validate input
  if (!Array.isArray(color) || color.length < 3 || color.length > 4) {
    console.warn("RGB to HSL conversion failed: Invalid array length");
    return null;
  }

  const [r, g, b, a] = color;

  // Validate that RGB values are numbers
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
    console.warn("RGB to HSL conversion failed: Invalid RGB value types");
    return null;
  }

  // Validate alpha if present
  if (a !== undefined && typeof a !== "number") {
    console.warn("RGB to HSL conversion failed: Invalid alpha value type");
    return null;
  }

  // Check for NaN values
  if (isNaN(r) || isNaN(g) || isNaN(b) || (a !== undefined && isNaN(a))) {
    console.warn("RGB to HSL conversion failed: NaN values detected");
    return null;
  }

  // Clamp RGB values to 0-255 and normalize to 0-1
  const normalizedR = Math.max(0, Math.min(255, Math.round(r))) / 255;
  const normalizedG = Math.max(0, Math.min(255, Math.round(g))) / 255;
  const normalizedB = Math.max(0, Math.min(255, Math.round(b))) / 255;

  // Clamp alpha to 0-1 if present
  const clampedA = a !== undefined ? Math.max(0, Math.min(1, a)) : undefined;

  // Calculate HSL
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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

  // Round values
  const hueValue = Math.round(h * 360);
  const saturationValue = Math.round(s * 100);
  const lightnessValue = Math.round(l * 100);

  // Return HSL or HSLA based on alpha presence
  if (clampedA !== undefined) {
    return `hsla(${hueValue}, ${saturationValue}%, ${lightnessValue}%, ${clampedA})`;
  }
  return `hsl(${hueValue}, ${saturationValue}%, ${lightnessValue}%)`;
};
