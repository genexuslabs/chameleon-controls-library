import { ColorVariants } from "../../../common/types";
import { getColorFormat } from "./color-format";
import { fromRgbToHex } from "./converters/rgb-to-hex";
import { fromRgbToHsl } from "./converters/rgb-to-hsl";
import { fromRgbToHsv } from "./converters/rgb-to-hsv";
import { fromHexStringToRgbaColor } from "./parsers/hex";
import { fromHslStringToRgbaColor } from "./parsers/hsl";
import { fromHsvStringToRgbColor } from "./parsers/hsv";
import { fromRgbaStringToRgbaColor } from "./parsers/rgba";

/**
 * Parses any color format string and returns all color variants
 * @param color - Color string in any supported format (hex, rgb, rgba, hsl, hsla)
 * @returns Object containing all color format variants or null if invalid
 */
export const fromStringToColorVariants = (
  color: string
): ColorVariants | null => {
  const format = getColorFormat(color);

  if (!format) {
    return null;
  }

  const colorParsers = {
    hex: fromHexStringToRgbaColor,
    hsl: fromHslStringToRgbaColor,
    hsla: fromHslStringToRgbaColor,
    hsv: fromHsvStringToRgbColor,
    rgb: fromRgbaStringToRgbaColor,
    rgba: fromRgbaStringToRgbaColor
  } as unknown as {
    r: number;
    g: number;
    b: number;
    a?: number;
  } | null;

  const parser = colorParsers[format];
  if (!parser) {
    return null;
  }

  const rgbaColor = parser(color);

  if (!rgbaColor) {
    return null;
  }

  const { r, g, b, a = 1 } = rgbaColor;

  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    hex: fromRgbToHex([r, g, b, a]),
    hsl: fromRgbToHsl([r, g, b]),
    hsla: fromRgbToHsl([r, g, b, a]),
    hsv: fromRgbToHsv([r, g, b])
  };
};
