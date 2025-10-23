import { ColorFormat, ColorVariants } from "../../common/types";

export const DEFAULT_COLOR_FORMAT = "hex" satisfies ColorFormat;
export const DEFAULT_COLOR_PALETTE = "#FFFFFF" satisfies ColorVariants["hex"];
export const FALLBACK_COLOR = "#000000" satisfies ColorVariants["hex"];
export const SELECTED_COLOR = "{{SELECTED_COLOR}}";
export const RGB_REGEX = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/i;
export const RGBA_REGEX = /rgba\(.*,\s*([\d.]+)\)/i;
export const HSL_REGEX =
  /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/i;
