import { ColorFormat } from "../../../common/types";

const hexRegex =
  /^\s*#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\s*$/;
const rgbaRegex =
  /^\s*rgba\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)\s*$/i;
const rgbRegex =
  /^\s*rgb\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)\s*$/i;
const hslaRegex =
  /^\s*hsla\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*\)\s*$/i;
const hslRegex =
  /^\s*hsl\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%\s*\)\s*$/i;
const hsvRegex =
  /^\s*hsv\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%\s*\)\s*$/i;

/**
 * Analyzes a color string to determine its format
 * @param color - Color string to analyze
 * @returns Analysis result with format
 */
export const getColorFormat = (color: string): ColorFormat | null => {
  if (!color || typeof color !== "string") {
    return null;
  }

  if (hexRegex.test(color)) {
    return "hex";
  }

  if (hslaRegex.test(color)) {
    return "hsla";
  }

  if (hslRegex.test(color)) {
    return "hsl";
  }

  if (hsvRegex.test(color)) {
    return "hsv";
  }

  if (rgbaRegex.test(color)) {
    return "rgba";
  }

  if (rgbRegex.test(color)) {
    return "rgb";
  }

  return null;
};
