import { fromHexStringToRgbaColor } from "../hex";

describe("Hex Color Functions", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid hex cases
  const testValidHexCases = testCases => {
    test.each(testCases)("should parse hex %s correctly", (input, expected) => {
      expect(fromHexStringToRgbaColor(input)).toEqual(expected);
    });
  };

  // Helper function to test invalid hex cases
  const testInvalidHexCases = testCases => {
    test.each(testCases)("should return null for invalid hex: %s", input => {
      expect(fromHexStringToRgbaColor(input)).toBeNull();
    });
  };

  // Function to test console warnings for hex
  const testHexConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for hex: %s`,
      input => {
        fromHexStringToRgbaColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromStringToRgba", () => {
    describe("Valid hex formats", () => {
      const validHexCases = [
        // 3-digit hex (#RGB) - with and without #
        ["#000", { r: 0, g: 0, b: 0, a: 1 }], // Black (boundary)
        ["#FFF", { r: 255, g: 255, b: 255, a: 1 }], // White (boundary)
        ["#F00", { r: 255, g: 0, b: 0, a: 1 }], // Red
        ["#0F0", { r: 0, g: 255, b: 0, a: 1 }], // Green
        ["#00F", { r: 0, g: 0, b: 255, a: 1 }], // Blue
        ["#ABC", { r: 170, g: 187, b: 204, a: 1 }], // Light blue-gray
        ["#123", { r: 17, g: 34, b: 51, a: 1 }], // Shorthand expansion test

        // 4-digit hex with alpha (#RGBA) - with and without #
        ["#0000", { r: 0, g: 0, b: 0, a: 0 }], // Transparent black (alpha boundary)
        ["#000F", { r: 0, g: 0, b: 0, a: 1 }], // Opaque black (alpha boundary)
        ["#FFFF", { r: 255, g: 255, b: 255, a: 1 }], // Opaque white
        ["#F008", { r: 255, g: 0, b: 0, a: 0.533 }], // Semi-transparent red (alpha precision)
        ["#0F08", { r: 0, g: 255, b: 0, a: 0.533 }], // Semi-transparent green
        ["#00F8", { r: 0, g: 0, b: 255, a: 0.533 }], // Semi-transparent blue
        ["#1234", { r: 17, g: 34, b: 51, a: 0.267 }], // Shorthand expansion with alpha
        ["#ABCD", { r: 170, g: 187, b: 204, a: 0.867 }], // Shorthand expansion with alpha

        // 6-digit hex (#RRGGBB) - with and without #
        ["#000000", { r: 0, g: 0, b: 0, a: 1 }], // Black (boundary)
        ["#FFFFFF", { r: 255, g: 255, b: 255, a: 1 }], // White (boundary)
        ["#FF0000", { r: 255, g: 0, b: 0, a: 1 }], // Red
        ["#00FF00", { r: 0, g: 255, b: 0, a: 1 }], // Green
        ["#0000FF", { r: 0, g: 0, b: 255, a: 1 }], // Blue
        ["#FFFF00", { r: 255, g: 255, b: 0, a: 1 }], // Yellow
        ["#FF00FF", { r: 255, g: 0, b: 255, a: 1 }], // Magenta
        ["#00FFFF", { r: 0, g: 255, b: 255, a: 1 }], // Cyan
        ["#808080", { r: 128, g: 128, b: 128, a: 1 }], // Gray
        ["#AABBCC", { r: 170, g: 187, b: 204, a: 1 }], // Light blue-gray

        // 8-digit hex with alpha (#RRGGBBAA) - with and without #
        ["#00000000", { r: 0, g: 0, b: 0, a: 0 }], // Transparent black (alpha boundary)
        ["#000000FF", { r: 0, g: 0, b: 0, a: 1 }], // Opaque black (alpha boundary)
        ["#FFFFFFFF", { r: 255, g: 255, b: 255, a: 1 }], // Opaque white
        ["#FF000080", { r: 255, g: 0, b: 0, a: 0.502 }], // Semi-transparent red (alpha precision)
        ["#00FF0080", { r: 0, g: 255, b: 0, a: 0.502 }], // Semi-transparent green
        ["#0000FF80", { r: 0, g: 0, b: 255, a: 0.502 }], // Semi-transparent blue
        ["#FFFF00FF", { r: 255, g: 255, b: 0, a: 1 }], // Opaque yellow
        ["#FF00FF00", { r: 255, g: 0, b: 255, a: 0 }], // Transparent magenta

        // Case variations (case insensitivity tests)
        ["#fff", { r: 255, g: 255, b: 255, a: 1 }], // Lowercase
        ["#ffffff", { r: 255, g: 255, b: 255, a: 1 }], // Lowercase
        ["#ff0000ff", { r: 255, g: 0, b: 0, a: 1 }], // Lowercase
        ["#AbC", { r: 170, g: 187, b: 204, a: 1 }], // Mixed case
        ["#AaBbCc", { r: 170, g: 187, b: 204, a: 1 }], // Mixed case
        ["#AaBbCcDd", { r: 170, g: 187, b: 204, a: 0.867 }] // Mixed case with alpha
      ];

      testValidHexCases(validHexCases);
    });

    describe("Invalid hex formats", () => {
      const invalidHexCases = [
        // Completely invalid formats
        "invalid-color",
        "",
        "rgb(255, 0, 0)",
        "hsl(0, 100%, 50%)",
        "#", // Edge case: only #

        // Without #
        "000",
        "FFF",
        "0000",
        "FFFF",
        "000000",
        "FFFFFF",
        "00000000",
        "FFFFFFFF",
        "FF000080",

        // Invalid lengths (edge cases)
        "#F",
        "#FF",
        "#FFFFF",
        "#FFFFFFF",
        "#FFFFFFFFF",

        // Invalid hex characters
        "#GGG",
        "#GGGGGG",
        "#GGGGGGGG",
        "#12345G",
        "#12345GH",
        "#G00",
        "#GG0000",
        "#FF00GG",
        "#FF00GG00",

        // Special characters (edge cases)
        "#FF-000",
        "#FF 000",
        "#FF.000",
        "#FF,000"
      ];

      testInvalidHexCases(invalidHexCases);
    });

    describe("Console warnings", () => {
      const validHexInputs = [
        "#000",
        "#FFFFFF",
        "#FF0000FF",
        "#ABC",
        "#aabbcc",
        "#AbCdEf12"
      ];

      const invalidHexInputs = [
        "invalid-color",
        "",
        "#",
        "000",
        "FFF",
        "#GGG",
        "#FF-000",
        "rgb(255, 0, 0)",
        "#FFFFF"
      ];

      testHexConsoleWarnings(false, validHexInputs);
      testHexConsoleWarnings(true, invalidHexInputs);
    });
  });
});
