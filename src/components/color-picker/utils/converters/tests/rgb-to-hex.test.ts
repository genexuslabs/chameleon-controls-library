import { fromRgbToHex } from "../rgb-to-hex";

describe("RGB to HEX Conversion", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid RGB to HEX conversions
  const testValidRgbToHexConversions = testCases => {
    test.each(testCases)(
      "should convert RGB %s to HEX correctly",
      (input, expected) => {
        expect(fromRgbToHex(input)).toBe(expected);
      }
    );
  };

  // Helper function to test invalid RGB inputs
  const testInvalidRgbInputs = testCases => {
    test.each(testCases)("should return null for invalid RGB: %s", input => {
      expect(fromRgbToHex(input)).toBeNull();
    });
  };

  // Function to test console warnings for RGB to HEX
  const testRgbToHexConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for RGB: %s`,
      input => {
        fromRgbToHex(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromRgbToHex", () => {
    describe("Valid RGB to HEX conversions", () => {
      const validRgbToHexCases = [
        // Primary colors
        [[255, 0, 0], "#ff0000"], // Red
        [[0, 255, 0], "#00ff00"], // Green
        [[0, 0, 255], "#0000ff"], // Blue

        // Secondary colors
        [[255, 255, 0], "#ffff00"], // Yellow
        [[0, 255, 255], "#00ffff"], // Cyan
        [[255, 0, 255], "#ff00ff"], // Magenta

        // Grayscale
        [[0, 0, 0], "#000000"], // Black
        [[255, 255, 255], "#ffffff"], // White
        [[128, 128, 128], "#808080"], // Gray
        [[64, 64, 64], "#404040"], // Dark gray
        [[192, 192, 192], "#c0c0c0"], // Light gray

        // Random colors
        [[170, 187, 204], "#aabbcc"], // Light blue
        [[255, 165, 0], "#ffa500"], // Orange
        [[128, 0, 128], "#800080"], // Purple
        [[255, 192, 203], "#ffc0cb"], // Pink

        // With alpha channel (not 1)
        [[255, 0, 0, 0.5], "#ff000080"], // Red with 50% alpha
        [[0, 255, 0, 0.25], "#00ff0040"], // Green with 25% alpha
        [[0, 0, 255, 0.75], "#0000ffbf"], // Blue with 75% alpha
        [[128, 128, 128, 0], "#80808000"], // Gray with 0% alpha
        [[255, 255, 255, 0.1], "#ffffff1a"], // White with 10% alpha

        // With alpha channel (1 - should not include alpha)
        [[255, 0, 0, 1], "#ff0000"], // Red with 100% alpha (omitted)
        [[0, 255, 0, 1], "#00ff00"], // Green with 100% alpha (omitted)
        [[0, 0, 255, 1], "#0000ff"], // Blue with 100% alpha (omitted)

        // Clamping cases (edge cases)
        [[300, 0, 0], "#ff0000"], // R clamped to 255
        [[0, 300, 0], "#00ff00"], // G clamped to 255
        [[0, 0, 300], "#0000ff"], // B clamped to 255
        [[-10, 0, 0], "#000000"], // R clamped to 0
        [[0, -10, 0], "#000000"], // G clamped to 0
        [[0, 0, -10], "#000000"], // B clamped to 0
        [[255, 255, 255, 1.5], "#ffffff"], // Alpha clamped to 1 (omitted)
        [[255, 0, 0, -0.5], "#ff000000"], // Alpha clamped to 0

        // Decimal values (should be rounded)
        [[255.7, 128.3, 64.9], "#ff8041"], // Rounded values
        [[100.2, 200.8, 50.1], "#64c932"], // More rounding
        [[127.5, 127.5, 127.5], "#808080"], // Exact half rounding

        // Boundary values (edge cases)
        [[0, 0, 0, 0], "#00000000"], // Black with 0 alpha
        [[255, 255, 255, 1], "#ffffff"], // White with full alpha (omitted)
        [[1, 1, 1], "#010101"], // Very dark gray
        [[254, 254, 254], "#fefefe"], // Very light gray

        // RGB with alpha undefined
        [[255, 0, 0, undefined], "#ff0000"], // Red with alpha undefined
        [[0, 255, 0, undefined], "#00ff00"], // Green with alpha undefined
        [[0, 0, 255, undefined], "#0000ff"] // Blue with alpha undefined
      ];

      testValidRgbToHexConversions(validRgbToHexCases);
    });

    describe("Invalid RGB inputs", () => {
      const invalidRgbInputs = [
        // Invalid array lengths
        [[], "empty array"],
        [[255], "single value"],
        [[255, 0], "two values"],
        [[255, 0, 0, 1, 2], "five values"],

        // Invalid types
        [["red", 0, 0], "string R value"],
        [[255, "green", 0], "string G value"],
        [[255, 0, "blue"], "string B value"],
        [[255, 0, 0, "alpha"], "string alpha value"],
        [[null, 0, 0], "null R value"],
        [[255, null, 0], "null G value"],
        [[255, 0, null], "null B value"],
        [[255, 0, 0, null], "null alpha value"],
        [[undefined, 0, 0], "undefined R value"],
        [[255, undefined, 0], "undefined G value"],
        [[255, 0, undefined], "undefined B value"],

        // Non-array inputs
        ["not an array", "string input"],
        [123, "number input"],
        [null, "null input"],
        [undefined, "undefined input"],
        [{}, "object input"],

        // NaN values
        [[NaN, 0, 0], "NaN R value"],
        [[255, NaN, 0], "NaN G value"],
        [[255, 0, NaN], "NaN B value"],
        [[255, 0, 0, NaN], "NaN alpha value"]
      ];

      testInvalidRgbInputs(invalidRgbInputs);
    });

    describe("Console warnings", () => {
      const validRgbInputs = [
        [[255, 0, 0], "red"],
        [[0, 255, 0, 1], "green with alpha"],
        [[0, 0, 255, 0.5], "blue with alpha"],
        [[300, -10, 150], "clamped values"],
        [[255.7, 128.3, 64.9], "decimal values"]
      ];

      const invalidRgbInputs = [
        [[], "empty array"],
        [["red", 0, 0], "string value"],
        [[255, 0], "incomplete array"],
        [[NaN, 0, 0], "NaN value"],
        ["not an array", "non-array"]
      ];

      testRgbToHexConsoleWarnings(false, validRgbInputs);
      testRgbToHexConsoleWarnings(true, invalidRgbInputs);
    });
  });
});
