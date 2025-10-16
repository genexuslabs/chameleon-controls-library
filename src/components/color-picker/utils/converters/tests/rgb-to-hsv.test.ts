import { fromRgbToHsv } from "../rgb-to-hsv";

describe("RGB to HSV Conversion", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid RGB to HSV conversions
  const testValidRgbToHsvConversions = testCases => {
    test.each(testCases)(
      "should convert RGB %s to HSV correctly",
      (input, expected) => {
        expect(fromRgbToHsv(input)).toEqual(expected);
      }
    );
  };

  // Helper function to test invalid RGB inputs
  const testInvalidRgbInputs = testCases => {
    test.each(testCases)("should return null for invalid RGB: %s", input => {
      expect(fromRgbToHsv(input)).toBeNull();
    });
  };

  // Function to test console warnings
  const testRgbToHsvConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for RGB: %s`,
      input => {
        fromRgbToHsv(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromRgbToHsv", () => {
    describe("Valid RGB to HSV conversions", () => {
      const validRgbToHsvCases = [
        // Primary colors
        [[255, 0, 0], { h: 0, s: 100, v: 100 }], // Red
        [[0, 255, 0], { h: 120, s: 100, v: 100 }], // Green
        [[0, 0, 255], { h: 240, s: 100, v: 100 }], // Blue

        // Secondary colors
        [[255, 255, 0], { h: 60, s: 100, v: 100 }], // Yellow
        [[0, 255, 255], { h: 180, s: 100, v: 100 }], // Cyan
        [[255, 0, 255], { h: 300, s: 100, v: 100 }], // Magenta

        // Grayscale (achromatic)
        [[0, 0, 0], { h: 0, s: 0, v: 0 }], // Black
        [[255, 255, 255], { h: 0, s: 0, v: 100 }], // White
        [[128, 128, 128], { h: 0, s: 0, v: 50 }], // Gray
        [[64, 64, 64], { h: 0, s: 0, v: 25 }], // Dark gray
        [[192, 192, 192], { h: 0, s: 0, v: 75 }], // Light gray

        // Intermediate colors
        [[255, 128, 0], { h: 30, s: 100, v: 100 }], // Orange
        [[128, 255, 0], { h: 90, s: 100, v: 100 }], // Lime
        [[0, 128, 255], { h: 210, s: 100, v: 100 }], // Sky blue
        [[255, 0, 128], { h: 330, s: 100, v: 100 }], // Pink-red
        [[128, 0, 255], { h: 270, s: 100, v: 100 }], // Purple
        [[0, 255, 128], { h: 150, s: 100, v: 100 }], // Spring green

        // Desaturated colors
        [[255, 128, 128], { h: 0, s: 50, v: 100 }], // Light red
        [[128, 255, 128], { h: 120, s: 50, v: 100 }], // Light green
        [[128, 128, 255], { h: 240, s: 50, v: 100 }], // Light blue

        // Dark colors (low value)
        [[128, 0, 0], { h: 0, s: 100, v: 50 }], // Dark red
        [[0, 128, 0], { h: 120, s: 100, v: 50 }], // Dark green
        [[0, 0, 128], { h: 240, s: 100, v: 50 }], // Dark blue

        // Complex colors
        [[170, 187, 204], { h: 210, s: 17, v: 80 }], // Light blue-gray
        [[255, 165, 0], { h: 39, s: 100, v: 100 }], // Orange
        [[128, 0, 128], { h: 300, s: 100, v: 50 }], // Purple
        [[255, 192, 203], { h: 350, s: 25, v: 100 }], // Pink

        // Clamping cases (edge cases)
        [[300, 0, 0], { h: 0, s: 100, v: 100 }], // R clamped to 255
        [[0, 300, 0], { h: 120, s: 100, v: 100 }], // G clamped to 255
        [[0, 0, 300], { h: 240, s: 100, v: 100 }], // B clamped to 255
        [[-10, 0, 0], { h: 0, s: 0, v: 0 }], // R clamped to 0
        [[0, -10, 0], { h: 0, s: 0, v: 0 }], // G clamped to 0
        [[0, 0, -10], { h: 0, s: 0, v: 0 }], // B clamped to 0
        [[1000, -50, 300], { h: 300, s: 100, v: 100 }], // Multiple clamping

        // Decimal values (should be rounded)
        [[255.7, 128.3, 64.9], { h: 20, s: 75, v: 100 }], // Rounded values
        [[100.2, 200.8, 50.1], { h: 100, s: 75, v: 79 }], // More rounding
        [[127.5, 127.5, 127.5], { h: 0, s: 0, v: 50 }], // Exact half rounding

        // Boundary values (edge cases)
        [[1, 1, 1], { h: 0, s: 0, v: 0 }], // Very dark (rounds to 0)
        [[254, 254, 254], { h: 0, s: 0, v: 100 }], // Very light
        [[255, 1, 1], { h: 0, s: 100, v: 100 }], // Almost pure red
        [[1, 255, 1], { h: 120, s: 100, v: 100 }], // Almost pure green
        [[1, 1, 255], { h: 240, s: 100, v: 100 }], // Almost pure blue

        // Edge cases for hue calculation
        [[255, 255, 1], { h: 60, s: 100, v: 100 }], // Almost yellow
        [[255, 1, 255], { h: 300, s: 100, v: 100 }], // Almost magenta
        [[1, 255, 255], { h: 180, s: 100, v: 100 }] // Almost cyan
      ];

      testValidRgbToHsvConversions(validRgbToHsvCases);
    });

    describe("Invalid RGB inputs", () => {
      const invalidRgbInputs = [
        // Invalid array lengths
        [[], "empty array"],
        [[255], "single value"],
        [[255, 0], "two values"],
        [[255, 0, 0, 255], "four values"],

        // Invalid types
        [["red", 0, 0], "string R value"],
        [[255, "green", 0], "string G value"],
        [[255, 0, "blue"], "string B value"],
        [[null, 0, 0], "null R value"],
        [[255, null, 0], "null G value"],
        [[255, 0, null], "null B value"],
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
        [[255, 0, NaN], "NaN B value"]
      ];

      testInvalidRgbInputs(invalidRgbInputs);
    });

    describe("Console warnings", () => {
      const validRgbInputs = [
        [[255, 0, 0], "red"],
        [[0, 255, 0], "green"],
        [[0, 0, 255], "blue"],
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

      testRgbToHsvConsoleWarnings(false, validRgbInputs);
      testRgbToHsvConsoleWarnings(true, invalidRgbInputs);
    });
  });
});
