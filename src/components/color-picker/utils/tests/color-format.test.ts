import { getColorFormat } from "../color-format";

describe("getColorFormat", () => {
  // Helper function to test valid color formats
  const testValidColorFormats = (format: string, testCases: string[]) => {
    test.each(testCases)(`should identify %s as ${format}`, input => {
      expect(getColorFormat(input)).toBe(format);
    });
  };

  // Helper function to test invalid cases
  const testInvalidCases = (testCases: string[]) => {
    test.each(testCases)("should return null for invalid input: %s", input => {
      expect(getColorFormat(input)).toBeNull();
    });
  };

  describe("Valid color formats", () => {
    describe("HEX format", () => {
      const validHexCases = [
        // 3-digit hex
        "#000",
        "#FFF",
        "#abc",
        "#123",

        // 4-digit hex (with alpha)
        "#000F",
        "#FFF0",
        "#abcd",
        "#1234",

        // 6-digit hex
        "#000000",
        "#FFFFFF",
        "#abcdef",
        "#123456",

        // 8-digit hex (with alpha)
        "#000000FF",
        "#FFFFFF00",
        "#abcdef12",
        "#12345678",

        // With spaces (should be handled by regex)
        "  #FFF  ",
        "\t#FFFFFF\n",
        " #abcdef ",

        // Mixed case
        "#AbCdEf",
        "#1A2B3C",
        "#fFfFfF"
      ];

      testValidColorFormats("hex", validHexCases);
    });

    describe("RGB format", () => {
      const validRgbCases = [
        // Standard RGB
        "rgb(0, 0, 0)",
        "rgb(255, 255, 255)",
        "rgb(128, 128, 128)",

        // With decimals
        "rgb(255.0, 128.5, 0.0)",
        "rgb(100.25, 200.75, 50.5)",

        // Different spacing
        "rgb(0,0,0)",
        "rgb( 255 , 255 , 255 )",
        "rgb(  100  ,  150  ,  200  )",

        // With surrounding spaces
        "  rgb(255, 255, 255)  ",
        "\trgb(0, 0, 0)\n",

        // Case variations
        "RGB(255, 255, 255)",
        "Rgb(128, 128, 128)",
        "rGB(0, 0, 0)"
      ];

      testValidColorFormats("rgb", validRgbCases);
    });

    describe("RGBA format", () => {
      const validRgbaCases = [
        // Standard RGBA
        "rgba(0, 0, 0, 0)",
        "rgba(255, 255, 255, 1)",
        "rgba(128, 128, 128, 0.5)",

        // Alpha variations
        "rgba(255, 0, 0, 0.0)",
        "rgba(0, 255, 0, 1.0)",
        "rgba(0, 0, 255, 0.25)",
        "rgba(128, 128, 128, 0.999)",

        // With decimals in RGB values
        "rgba(255.0, 128.5, 0.0, 0.5)",

        // Different spacing
        "rgba(0,0,0,0)",
        "rgba( 255 , 255 , 255 , 1 )",

        // With surrounding spaces
        "  rgba(255, 255, 255, 1)  ",

        // Case variations
        "RGBA(255, 255, 255, 1)",
        "Rgba(128, 128, 128, 0.5)"
      ];

      testValidColorFormats("rgba", validRgbaCases);
    });

    describe("HSL format", () => {
      const validHslCases = [
        // Standard HSL
        "hsl(0, 0%, 0%)",
        "hsl(360, 100%, 100%)",
        "hsl(180, 50%, 50%)",

        // With decimals
        "hsl(359.9, 99.9%, 99.9%)",
        "hsl(0.1, 0.1%, 0.1%)",
        "hsl(180.5, 50.5%, 50.5%)",

        // Different spacing
        "hsl(0,0%,0%)",
        "hsl( 360 , 100% , 100% )",

        // With surrounding spaces
        "  hsl(180, 50%, 50%)  ",

        // Case variations
        "HSL(360, 100%, 100%)",
        "Hsl(180, 50%, 50%)"
      ];

      testValidColorFormats("hsl", validHslCases);
    });

    describe("HSLA format", () => {
      const validHslaCases = [
        // Standard HSLA
        "hsla(0, 0%, 0%, 0)",
        "hsla(360, 100%, 100%, 1)",
        "hsla(180, 50%, 50%, 0.5)",

        // Alpha variations
        "hsla(0, 0%, 0%, 0.0)",
        "hsla(360, 100%, 100%, 1.0)",
        "hsla(180, 50%, 50%, 0.25)",
        "hsla(90, 25%, 75%, 0.999)",

        // With decimals
        "hsla(359.9, 99.9%, 99.9%, 0.5)",

        // Different spacing
        "hsla(0,0%,0%,0)",
        "hsla( 360 , 100% , 100% , 1 )",

        // With surrounding spaces
        "  hsla(180, 50%, 50%, 0.5)  ",

        // Case variations
        "HSLA(360, 100%, 100%, 1)",
        "Hsla(180, 50%, 50%, 0.5)"
      ];

      testValidColorFormats("hsla", validHslaCases);
    });
  });

  describe("Invalid color formats", () => {
    const invalidCases = [
      // Invalid formats
      null,
      undefined,
      "",
      "   ",

      // Invalid hex formats
      "#",
      "#G",
      "#GGG",
      "#GGGGGG",
      "123456", // Missing #
      "#12", // Wrong length
      "#12345", // Wrong length
      "#1234567", // Wrong length
      "#123456789", // Wrong length

      // Invalid RGB formats
      "rgb",
      "rgb()",
      "rgb(0, -1, 0)", // Negative
      "rgb(0, 0)", // Missing value
      "rgb(0, 0, 0, 0)", // Extra value (should be rgba)
      "rgb(a, b, c)", // Non-numeric

      // Invalid RGBA formats
      "rgba",
      "rgba()",
      "rgba(0, 0, 0)", // Missing alpha
      "rgba(0, 0, 0, -0.1)", // Negative alpha

      // Invalid HSL formats
      "hsl",
      "hsl()",
      "hsl(180, 50, 50)", // Missing % signs
      "hsl(180, 50%, 50%, 0.5)", // Extra value (should be hsla)

      // Invalid HSLA formats
      "hsla",
      "hsla()",
      "hsla(180, 50%, 50%)", // Missing alpha

      // Mixed formats
      "rgb(#FFF)",
      "hsl(rgb(255, 255, 255))",
      "#rgb(255, 255, 255)",

      // Random strings
      "red",
      "blue",
      "not a color",
      "123 456 789"
    ];

    testInvalidCases(invalidCases);
  });
});
