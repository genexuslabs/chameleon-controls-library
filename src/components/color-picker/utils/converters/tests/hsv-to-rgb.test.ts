import { fromHsvToRgb } from "../hsv-to-rgb";

describe("HSV to RGB Conversion", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid HSV conversions
  const testValidHsvConversions = testCases => {
    test.each(testCases)(
      "should convert HSV %s correctly",
      (input, expected) => {
        const [h, s, v] = input;
        expect(fromHsvToRgb(h, s, v)).toEqual(expected);
      }
    );
  };

  // Helper function to test invalid HSV inputs
  const testInvalidHsvInputs = testCases => {
    test.each(testCases)("should return null for invalid HSV: %s", input => {
      const [h, s, v] = input;
      expect(fromHsvToRgb(h, s, v)).toBeNull();
    });
  };

  // Function to test console warnings for HSV
  const testHsvConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for HSV: %s`,
      input => {
        const [h, s, v] = input;
        fromHsvToRgb(h, s, v);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromHsvToRgb", () => {
    describe("Valid HSV conversions", () => {
      const validHsvCases = [
        // Primary colors
        [
          [0, 100, 100],
          [255, 0, 0]
        ], // Red
        [
          [120, 100, 100],
          [0, 255, 0]
        ], // Green
        [
          [240, 100, 100],
          [0, 0, 255]
        ], // Blue

        // Secondary colors
        [
          [60, 100, 100],
          [255, 255, 0]
        ], // Yellow
        [
          [180, 100, 100],
          [0, 255, 255]
        ], // Cyan
        [
          [300, 100, 100],
          [255, 0, 255]
        ], // Magenta

        // Grayscale values
        [
          [0, 0, 0],
          [0, 0, 0]
        ], // Black
        [
          [0, 0, 100],
          [255, 255, 255]
        ], // White
        [
          [0, 0, 50],
          [128, 128, 128]
        ], // Gray
        [
          [180, 0, 75],
          [191, 191, 191]
        ], // Light gray (hue irrelevant when S=0)

        // Intermediate values
        [
          [30, 50, 80],
          [204, 153, 102]
        ], // Brown-ish
        [
          [210, 25, 90],
          [172, 201, 230]
        ], // Light blue
        [
          [90, 75, 60],
          [96, 153, 38]
        ], // Olive green

        // Hue wrapping cases (edge cases)
        [
          [360, 100, 100],
          [255, 0, 0]
        ], // Same as 0° (red)
        [
          [480, 100, 100],
          [0, 255, 0]
        ], // Same as 120° (green)
        [
          [720, 100, 100],
          [255, 0, 0]
        ], // Same as 0° (red)
        [
          [-60, 100, 100],
          [255, 0, 255]
        ], // Same as 300° (magenta)
        [
          [-120, 100, 100],
          [0, 0, 255]
        ], // Same as 240° (blue)

        // Saturation clamping (edge cases)
        [
          [0, 150, 100],
          [255, 0, 0]
        ], // S clamped to 100
        [
          [120, 200, 100],
          [0, 255, 0]
        ], // S clamped to 100
        [
          [0, -10, 100],
          [255, 255, 255]
        ], // S clamped to 0 (white)
        [
          [240, -25, 100],
          [255, 255, 255]
        ], // S clamped to 0 (white)

        // Value clamping (edge cases)
        [
          [0, 100, 150],
          [255, 0, 0]
        ], // V clamped to 100
        [
          [120, 100, 200],
          [0, 255, 0]
        ], // V clamped to 100
        [
          [0, 100, -10],
          [0, 0, 0]
        ], // V clamped to 0 (black)
        [
          [240, 100, -25],
          [0, 0, 0]
        ], // V clamped to 0 (black)

        // Multiple clamping (edge cases)
        [
          [400, 150, 150],
          [255, 170, 0]
        ], // H wrapped (40°), S and V clamped
        [
          [-100, -50, -25],
          [0, 0, 0]
        ], // H wrapped, S and V clamped to 0

        // Boundary values (edge cases)
        [
          [0, 0, 100],
          [255, 255, 255]
        ], // Hue boundary with white
        [
          [359, 100, 100],
          [255, 0, 4]
        ], // Hue boundary near red
        [
          [0, 100, 0],
          [0, 0, 0]
        ], // Value boundary (black)
        [
          [0, 100, 100],
          [255, 0, 0]
        ], // Saturation boundary (pure red)

        // Decimal inputs (precision cases)
        [
          [0.5, 50.5, 75.7],
          [193, 96, 96]
        ], // Decimal hue, saturation, value
        [
          [120.3, 25.8, 90.1],
          [170, 230, 171]
        ], // Decimal precision
        [
          [45.7, 33.2, 67.8],
          [173, 159, 115]
        ], // More decimal cases

        // Rounding cases (precision cases)
        [
          [45, 33, 67],
          [171, 157, 114]
        ], // Cases that produce fractional RGB
        [
          [200, 80, 45],
          [23, 84, 115]
        ], // More rounding cases
        [
          [75, 60, 85],
          [184, 217, 87]
        ] // Additional rounding verification
      ];

      testValidHsvConversions(validHsvCases);
    });

    describe("Invalid HSV inputs", () => {
      const invalidHsvCases = [
        // Invalid types
        [["red", 50, 50], "string hue"],
        [[0, "green", 50], "string saturation"],
        [[0, 50, "blue"], "string value"],
        [[null, 50, 50], "null hue"],
        [[0, null, 50], "null saturation"],
        [[0, 50, null], "null value"],
        [[undefined, 50, 50], "undefined hue"],
        [[0, undefined, 50], "undefined saturation"],
        [[0, 50, undefined], "undefined value"],
        [[{}, 50, 50], "object hue"],
        [[0, [], 50], "array saturation"],
        [[0, 50, true], "boolean value"],
        [[NaN, 0, 0], "NaN H value"],
        [[255, NaN, 0], "NaN S value"],
        [[255, 0, NaN], "NaN V value"]
      ];

      testInvalidHsvInputs(invalidHsvCases);
    });

    describe("Console warnings", () => {
      const validHsvInputs = [
        [[0, 100, 100], "red"],
        [[120, 100, 100], "green"],
        [[240, 100, 100], "blue"],
        [[360, 150, 150], "clamped values"],
        [[-60, -10, -10], "negative values (clamped)"],
        [[0.5, 50.5, 75.7], "decimal values"]
      ];

      const invalidHsvInputs = [
        [["red", 50, 50], "string hue"],
        [[0, "green", 50], "string saturation"],
        [[0, 50, "blue"], "string value"],
        [[null, 50, 50], "null hue"],
        [[undefined, 50, 50], "undefined hue"],
        [[NaN, 50, 50], "NaN hue"]
      ];

      testHsvConsoleWarnings(false, validHsvInputs);
      testHsvConsoleWarnings(true, invalidHsvInputs);
    });
  });
});
