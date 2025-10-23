/** Regular expression to validate hex color format */
const hexRegex =
  /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{4}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/i;

/**
 * Parses a hex color string with support for shorthand and alpha channels
 * @param hex - Hex color string (e.g., "#FF0000", "#F00", "#FF0000FF", "#F00F")
 * @returns Object with r, g, b, and a values, or null if parsing fails
 */
export const fromHexStringToRgbaColor = (
  hex: string
): { r: number; g: number; b: number; a: number } | null => {
  // Validate hex string format
  if (!hexRegex.test(hex)) {
    console.warn("Parsing from hex string to RGBA Color failed");
    return null;
  }

  // Remove # if present
  hex = hex.replace("#", "");

  let r: number,
    g: number,
    b: number,
    a: number = 1;

  if (hex.length === 3) {
    // RGB -> RRGGBB
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 4) {
    // RGBA -> RRGGBBAA
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    a = Math.round((parseInt(hex[3] + hex[3], 16) / 255) * 1000) / 1000; // Round to 3 decimals
  } else if (hex.length === 6) {
    // RRGGBB
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    // RRGGBBAA
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 1000) / 1000; // Round to 3 decimals
  }

  return { r, g, b, a };
};
