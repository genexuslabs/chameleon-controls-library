import { fromRgbToHsl } from "../rgb-to-hsl";

describe("RGB to HSL Conversion", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid RGB to HSL conversions
  const testValidRgbToHslConversions = testCases => {
    test.each(testCases)(
      "should convert RGB %s to HSL correctly",
      (input, expected) => {
        expect(fromRgbToHsl(input)).toBe(expected);
      }
    );
  };

  // Helper function to test invalid RGB inputs
  const testInvalidRgbInputs = testCases => {
    test.each(testCases)("should return null for invalid RGB: %s", input => {
      expect(fromRgbToHsl(input)).toBeNull();
    });
  };

  // Function to test console warnings
  const testRgbToHslConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for RGB: %s`,
      input => {
        fromRgbToHsl(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromRgbToHsl", () => {
    describe("Valid RGB/RGBA to HSL/HSLA conversions", () => {
      const validRgbToHslCases = [
        // Primary colors (RGB)
        [[255, 0, 0], "hsl(0, 100%, 50%)"], // Red
        [[0, 255, 0], "hsl(120, 100%, 50%)"], // Green
        [[0, 0, 255], "hsl(240, 100%, 50%)"], // Blue

        // Secondary colors (RGB)
        [[255, 255, 0], "hsl(60, 100%, 50%)"], // Yellow
        [[0, 255, 255], "hsl(180, 100%, 50%)"], // Cyan
        [[255, 0, 255], "hsl(300, 100%, 50%)"], // Magenta

        // Grayscale (RGB)
        [[0, 0, 0], "hsl(0, 0%, 0%)"], // Black
        [[255, 255, 255], "hsl(0, 0%, 100%)"], // White
        [[128, 128, 128], "hsl(0, 0%, 50%)"], // Gray
        [[64, 64, 64], "hsl(0, 0%, 25%)"], // Dark gray
        [[192, 192, 192], "hsl(0, 0%, 75%)"], // Light gray

        // Primary colors with alpha (RGBA)
        [[255, 0, 0, 1], "hsla(0, 100%, 50%, 1)"], // Red with alpha
        [[0, 255, 0, 0.5], "hsla(120, 100%, 50%, 0.5)"], // Green with alpha
        [[0, 0, 255, 0], "hsla(240, 100%, 50%, 0)"], // Blue with alpha

        // Complex colors (RGB)
        [[170, 187, 204], "hsl(210, 25%, 73%)"], // Light blue
        [[255, 165, 0], "hsl(39, 100%, 50%)"], // Orange
        [[128, 0, 128], "hsl(300, 100%, 25%)"], // Purple
        [[255, 192, 203], "hsl(350, 100%, 88%)"], // Pink

        // Complex colors with alpha (RGBA)
        [[170, 187, 204, 0.8], "hsla(210, 25%, 73%, 0.8)"], // Light blue with alpha
        [[255, 165, 0, 0.3], "hsla(39, 100%, 50%, 0.3)"], // Orange with alpha

        // Clamping cases (edge cases)
        [[300, 0, 0], "hsl(0, 100%, 50%)"], // R clamped to 255
        [[0, 300, 0], "hsl(120, 100%, 50%)"], // G clamped to 255
        [[0, 0, 300], "hsl(240, 100%, 50%)"], // B clamped to 255
        [[-10, 0, 0], "hsl(0, 0%, 0%)"], // R clamped to 0
        [[0, -10, 0], "hsl(0, 0%, 0%)"], // G clamped to 0
        [[0, 0, -10], "hsl(0, 0%, 0%)"], // B clamped to 0
        [[255, 0, 0, 1.5], "hsla(0, 100%, 50%, 1)"], // Alpha clamped to 1
        [[255, 0, 0, -0.5], "hsla(0, 100%, 50%, 0)"], // Alpha clamped to 0

        // Decimal values (should be rounded)
        [[255.7, 128.3, 64.9], "hsl(20, 100%, 63%)"], // Rounded values
        [[100.2, 200.8, 50.1], "hsl(100, 60%, 49%)"], // More rounding

        // Boundary values (edge cases)
        [[1, 1, 1], "hsl(0, 0%, 0%)"], // Very dark
        [[254, 254, 254], "hsl(0, 0%, 100%)"], // Very light
        [[255, 255, 255, 0], "hsla(0, 0%, 100%, 0)"] // White with 0 alpha
      ];

      testValidRgbToHslConversions(validRgbToHslCases);
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

        // Non-array inputs
        ["not an array", "string input"],
        [123, "number input"],
        [null, "null input"],
        [undefined, "undefined input"],

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
        [[300, -10, 150], "clamped values"]
      ];

      const invalidRgbInputs = [
        [[], "empty array"],
        [["red", 0, 0], "string value"],
        [[255, 0], "incomplete array"],
        [[NaN, 0, 0], "NaN value"]
      ];

      testRgbToHslConsoleWarnings(false, validRgbInputs);
      testRgbToHslConsoleWarnings(true, invalidRgbInputs);
    });
  });
});
