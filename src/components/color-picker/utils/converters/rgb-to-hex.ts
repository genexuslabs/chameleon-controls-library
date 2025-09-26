/**
 * Converts RGB values to HEX color format
 * @param color - Array containing [r, g, b, a?] values (0-255 for RGB, 0-1 for alpha)
 * @returns HEX color string with optional alpha channel, or null if invalid input
 */
export const fromRgbToHex = (
  color: [number, number, number, number?]
): string | null => {
  // Validate input
  if (!Array.isArray(color) || color.length < 3 || color.length > 4) {
    console.warn("RGB to HEX conversion failed: Invalid array length");
    return null;
  }

  const [r, g, b, a] = color;

  // Validate that all values are numbers
  if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") {
    console.warn("RGB to HEX conversion failed: Invalid RGB value types");
    return null;
  }

  // Validate alpha if present
  if (a !== undefined && typeof a !== "number") {
    console.warn("RGB to HEX conversion failed: Invalid alpha value type");
    return null;
  }

  // Check for NaN values
  if (isNaN(r) || isNaN(g) || isNaN(b) || (a !== undefined && isNaN(a))) {
    console.warn("RGB to HEX conversion failed: NaN values detected");
    return null;
  }

  // Clamp RGB values to 0-255
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));

  // Clamp alpha to 0-1
  const clampedA = a !== undefined ? Math.max(0, Math.min(1, a)) : undefined;

  const hex = `#${((1 << 24) + (clampedR << 16) + (clampedG << 8) + clampedB)
    .toString(16)
    .slice(1)}`;

  // Add alpha
  if (clampedA !== undefined && clampedA !== 1) {
    const alphaHex = Math.round(clampedA * 255)
      .toString(16)
      .padStart(2, "0");
    return hex + alphaHex;
  }

  return hex;
};
