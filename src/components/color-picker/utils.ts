// Define the valid color formats
export type ColorFormat = "rgb" | "rgba" | "hex" | "hsl" | "hsla";
export type ColorVariants = {
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hex: string;
};

export const parseRgba = (color: string) => {
  const result = color.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?\.?\d+))?\s*\)/
  );
  if (result) {
    return {
      r: parseInt(result[1]),
      g: parseInt(result[2]),
      b: parseInt(result[3]),
      a: result[4] ? parseFloat(result[4]) : 1 // Alpha set to 1 if not provided
    };
  }
  console.warn("Parsing rgba failed");
  return { r: 0, g: 0, b: 0, a: 1 }; // Default black if parsing fails
};

// Function to validate the base color
export const isValidColor = (color: string): boolean => {
  // Regex to check for rgb, rgba, hex, hsl, and hsla formats
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const rgbaRegex =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
  const hslaRegex =
    /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

  return (
    rgbRegex.test(color) ||
    rgbaRegex.test(color) ||
    hexRegex.test(color) ||
    hslRegex.test(color) ||
    hslaRegex.test(color)
  );
};

export const isValidColorFormat = (format: any): format is ColorFormat => {
  return ["rgb", "rgba", "hsl", "hsla", "hex"].includes(format);
};

export const rgbToHex = (color: any): string => {
  const [r, g, b] = color;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const rgbToHsl = (color: any): string => {
  let [r, g, b] = color;

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
};

export const rgbToHsla = (color: any): string => {
  const hsl = rgbToHsl(color);
  return `${hsl.slice(0, -1)}, ${color[3]})`;
};
