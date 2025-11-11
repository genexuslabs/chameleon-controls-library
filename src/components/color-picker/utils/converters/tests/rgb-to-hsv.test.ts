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
  const testValidRgbToHsvCases = testCases => {
    test.each(testCases)(
      "should convert RGB [%i, %i, %i] to HSV correctly",
      (input, expected) => {
        expect(fromRgbToHsv(input)).toEqual(expected);
      }
    );
  };

  // Helper function to test invalid cases
  const testInvalidRgbToHsvCases = testCases => {
    test.each(testCases)("should return null for invalid RGB: %p", input => {
      expect(fromRgbToHsv(input)).toBeNull();
    });
  };

  // Function to test console warnings
  const testRgbToHsvConsoleWarnings = (shouldWarn, testCases) => {
    testCases.forEach(input => {
      test(`should ${
        shouldWarn ? "" : "not "
      }log warning for RGB: ${JSON.stringify(input)}`, () => {
        consoleSpy.mockClear();
        fromRgbToHsv(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      });
    });
  };

  describe("fromRgbToHsv", () => {
    describe("Valid RGB to HSV conversions", () => {
      const validRgbToHsvCases = [
        // Basic colors
        [[0, 0, 0], "hsv(0, 0%, 0%)"], // Black
        [[255, 255, 255], "hsv(0, 0%, 100%)"], // White
        [[255, 0, 0], "hsv(0, 100%, 100%)"], // Red
        [[0, 255, 0], "hsv(120, 100%, 100%)"], // Green
        [[0, 0, 255], "hsv(240, 100%, 100%)"], // Blue

        // Secondary colors
        [[255, 255, 0], "hsv(60, 100%, 100%)"], // Yellow
        [[0, 255, 255], "hsv(180, 100%, 100%)"], // Cyan
        [[255, 0, 255], "hsv(300, 100%, 100%)"], // Magenta

        // Grays
        [[128, 128, 128], "hsv(0, 0%, 50%)"], // Medium gray
        [[64, 64, 64], "hsv(0, 0%, 25%)"], // Dark gray
        [[192, 192, 192], "hsv(0, 0%, 75%)"], // Light gray

        // Other colors
        [[255, 128, 0], "hsv(30, 100%, 100%)"], // Orange
        [[128, 255, 0], "hsv(90, 100%, 100%)"], // Yellow-green
        [[0, 128, 255], "hsv(210, 100%, 100%)"], // Sky blue
        [[255, 0, 128], "hsv(330, 100%, 100%)"], // Pink-red
        [[128, 0, 255], "hsv(270, 100%, 100%)"], // Purple
        [[0, 255, 128], "hsv(150, 100%, 100%)"], // Spring green

        // Mid-saturation colors
        [[255, 128, 128], "hsv(0, 50%, 100%)"], // Light red
        [[128, 255, 128], "hsv(120, 50%, 100%)"], // Light green
        [[128, 128, 255], "hsv(240, 50%, 100%)"], // Light blue

        // Other test colors
        [[170, 187, 204], "hsv(210, 17%, 80%)"], // Light blue-gray
        [[255, 165, 0], "hsv(39, 100%, 100%)"], // Orange
        [[128, 0, 128], "hsv(300, 100%, 50%)"], // Purple
        [[255, 192, 203], "hsv(350, 25%, 100%)"], // Pink

        // Edge cases with clamping
        [[300, 0, 0], "hsv(0, 100%, 100%)"], // R > 255 clamped
        [[0, 300, 0], "hsv(120, 100%, 100%)"], // G > 255 clamped
        [[0, 0, 300], "hsv(240, 100%, 100%)"], // B > 255 clamped
        [[-10, 0, 0], "hsv(0, 0%, 0%)"], // Negative R clamped
        [[0, -10, 0], "hsv(0, 0%, 0%)"], // Negative G clamped
        [[0, 0, -10], "hsv(0, 0%, 0%)"], // Negative B clamped
        [[1000, -50, 300], "hsv(300, 100%, 100%)"], // Mixed out of range

        // Decimal values
        [[255.7, 128.3, 64.9], "hsv(20, 75%, 100%)"], // Decimals rounded
        [[100.2, 200.8, 50.1], "hsv(100, 75%, 79%)"], // More decimals
        [[127.5, 127.5, 127.5], "hsv(0, 0%, 50%)"] // Gray with decimals
      ];

      testValidRgbToHsvCases(validRgbToHsvCases);
    });

    describe("Invalid RGB inputs", () => {
      const invalidRgbToHsvCases = [
        null,
        undefined,
        [],
        [255], // Only one value
        [255, 0], // Only two values
        [255, 0, 0, 0], // Four values
        ["255", "0", "0"], // String values
        [NaN, 0, 0], // NaN values
        "255, 0, 0" // String instead of array
      ];

      testInvalidRgbToHsvCases(invalidRgbToHsvCases);
    });

    describe("Console warnings", () => {
      const validRgbInputs = [
        [0, 0, 0],
        [255, 255, 255],
        [255, 0, 0],
        [128, 128, 128]
      ];

      const invalidRgbInputs = [
        null,
        undefined,
        [],
        [255],
        [255, 0],
        ["255", "0", "0"],
        [NaN, 0, 0],
        "255, 0, 0"
      ];

      testRgbToHsvConsoleWarnings(false, validRgbInputs);
      testRgbToHsvConsoleWarnings(true, invalidRgbInputs);
    });
  });
});
