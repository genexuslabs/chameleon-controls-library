// Define the valid color formats
export type ColorFormat = "rgb" | "rgba" | "hex" | "hsl" | "hsla" | "hsv";
export type ColorVariants = {
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hex: string;
  hsv: { h: number; s: number; v: number };
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
  // TODO: Review if this is the expected behavior.
  return { r: 0, g: 0, b: 0, a: 1 }; // Default black if parsing fails
};

export const rgbToHex = (color: any): string => {
  const [r, g, b, a] = color;
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;

  // Add alpha channel if present and not 1 (fully opaque)
  if (a !== undefined && a !== 1) {
    const alphaHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    return hex + alphaHex;
  }

  return hex;
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

// RGB to HSV conversion
export const rgbToHsv = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
};

// HSV to RGB conversion
export const hsvToRgb = (
  h: number,
  s: number,
  v: number
): [number, number, number] => {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r, g, b;

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
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Parse hex color with support for shorthand and alpha
export const parseHex = (hex: string) => {
  // Remove # if present
  hex = hex.replace("#", "");

  let r,
    g,
    b,
    a = 1;

  if (hex.length === 3) {
    // #RGB -> #RRGGBB
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 4) {
    // #RGBA -> #RRGGBBAA
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6) {
    // #RRGGBB
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    // #RRGGBBAA
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    return null;
  }

  return { r, g, b, a };
};

// Parse HSL/HSLA color and return RGB
export const parseHsl = (hsl: string) => {
  // Support both hsl() and hsla() formats
  const result = hsl.match(
    /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*(\d?\.?\d+))?\s*\)/
  );
  if (result) {
    const h = parseInt(result[1]);
    const s = parseInt(result[2]) / 100;
    const l = parseInt(result[3]) / 100;
    const a = result[4] ? parseFloat(result[4]) : 1; // Alpha set to 1 if not provided

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r, g, b;
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
      b: Math.round((b + m) * 255),
      a
    };
  }
  return null;
};

// Parse HSL color and return HSL components
export const parseHslComponents = (
  hsl: string
): { h: number; s: number; l: number } => {
  const result = hsl.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
  if (result) {
    return {
      h: parseInt(result[1]),
      s: parseInt(result[2]),
      l: parseInt(result[3])
    };
  }
  return { h: 0, s: 0, l: 0 }; // Fallback
};

// Parse any color format and return all variants
export const parseColor = (color: string): ColorVariants => {
  let rgb: { r: number; g: number; b: number; a: number };

  if (color.startsWith("#")) {
    rgb = parseHex(color);
  } else if (color.startsWith("hsl")) {
    rgb = parseHsl(color);
  } else if (color.startsWith("rgb")) {
    rgb = parseRgba(color);
  } else {
    throw new Error(`Unsupported color format: ${color}`);
  }

  if (!rgb) {
    throw new Error(`Invalid color: ${color}`);
  }

  const { r, g, b, a } = rgb;
  const hsv = rgbToHsv(r, g, b);

  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    hex: rgbToHex([r, g, b, a]),
    hsl: rgbToHsl([r, g, b]),
    hsla: rgbToHsla([r, g, b, a]),
    hsv
  };
};
