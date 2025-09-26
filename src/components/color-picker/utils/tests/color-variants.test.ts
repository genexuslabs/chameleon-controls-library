import { fromStringToColorVariants } from "../color-variants";

describe("fromStringToColorVariants", () => {
  // Helper function to test valid color conversions
  const testValidColorConversions = testCases => {
    test.each(testCases)("should convert %s to all color variants", input => {
      const result = fromStringToColorVariants(input);

      // Just verify we get a result with all expected properties
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("rgb");
      expect(result).toHaveProperty("rgba");
      expect(result).toHaveProperty("hex");
      expect(result).toHaveProperty("hsl");
      expect(result).toHaveProperty("hsla");
      expect(result).toHaveProperty("hsv");

      // Verify hsv has the expected structure
      expect(result.hsv).toHaveProperty("h");
      expect(result.hsv).toHaveProperty("s");
      expect(result.hsv).toHaveProperty("v");
    });
  };

  // Helper function to test invalid cases
  const testInvalidColorConversions = testCases => {
    test.each(testCases)("should return null for %s", input => {
      expect(fromStringToColorVariants(input)).toBeNull();
    });
  };

  describe("Valid color conversions", () => {
    const validColorCases = [
      ["#fff", "3-digit hex"],
      ["#000", "3-digit hex black"],
      ["#ff0000", "6-digit hex red"],
      ["#00ff00", "6-digit hex green"],
      ["#0000ff", "6-digit hex blue"],
      ["#00ff0080", "8-digit hex with alpha"],
      ["rgb(128, 128, 128)", "rgb gray"],
      ["rgb(0,0,0)", "rgb black without spaces"],
      ["RGB(255, 255, 255)", "RGB uppercase"],
      ["rgba(255, 0, 0, 0.5)", "rgba with 0.5 alpha"],
      ["rgba(0, 0, 255, 0)", "rgba fully transparent"],
      ["RGBA(0, 255, 0, 1)", "RGBA uppercase"],
      ["hsl(0, 0%, 0%)", "hsl black"],
      ["hsl(120, 100%, 50%)", "hsl green"],
      ["HSL(240, 100%, 50%)", "HSL uppercase"],
      ["hsla(0, 100%, 50%, 0.5)", "hsla red with alpha"],
      ["hsla(240, 100%, 50%, 0.75)", "hsla blue with alpha"],
      ["HSLA(120, 100%, 50%, 0)", "HSLA uppercase transparent"]
    ];

    testValidColorConversions(validColorCases);
  });

  describe("Invalid color conversions", () => {
    const invalidColorCases = [
      ["", "empty string"],
      [null, "null"],
      [undefined, "undefined"],
      [123, "number"],
      [true, "boolean"],
      [{}, "object"],
      [[], "array"],
      ["not a color", "random string"],
      ["red", "named color"],
      ["#gg", "invalid hex"],
      ["rgb()", "empty rgb"],
      ["rgba(255, 255, 255)", "rgba missing alpha"],
      ["hsl()", "empty hsl"],
      ["hsla(360, 100%, 50%)", "hsla missing alpha"]
    ];

    testInvalidColorConversions(invalidColorCases);
  });
});
