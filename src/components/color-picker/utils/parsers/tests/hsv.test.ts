import { fromHsvStringToHsvColor, fromHsvStringToRgbColor } from "../hsv";

describe("HSV Color Functions", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid hsv strings cases
  const testValidHsvCases = testCases => {
    test.each(testCases)("should parse HSV %s correctly", (input, expected) => {
      expect(fromHsvStringToHsvColor(input)).toEqual(expected);
    });
  };

  // Helper function to test invalid cases
  const testInvalidHsvCases = testCases => {
    test.each(testCases)("should return null for invalid HSV: %s", input => {
      expect(fromHsvStringToHsvColor(input)).toBeNull();
    });
  };

  const testValidHsvToRgbCases = testCases => {
    test.each(testCases)(
      "should convert HSV %s to RGB correctly",
      (input, expected) => {
        const result = fromHsvStringToRgbColor(input);
        expect(result).toEqual(expected);
      }
    );
  };

  const testInvalidHsvToRgbCases = testCases => {
    test.each(testCases)("should return null for invalid HSV: %s", input => {
      expect(fromHsvStringToRgbColor(input)).toBeNull();
    });
  };

  // Function to test console warnings for HSV
  const testHsvConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for HSV: %s`,
      input => {
        fromHsvStringToHsvColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  // Function to test console warnings for HSV to RGB
  const testHsvToRgbConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for HSV to RGB: %s`,
      input => {
        fromHsvStringToRgbColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromHsvStringToHsvColor", () => {
    describe("Valid HSV formats", () => {
      const validHsvCases = [
        // Basic HSV
        ["hsv(0, 0%, 0%)", { h: 0, s: 0, v: 0 }],
        ["hsv(0, 0%, 100%)", { h: 0, s: 0, v: 100 }],
        ["hsv(0, 100%, 50%)", { h: 0, s: 100, v: 50 }],
        ["hsv(120, 100%, 50%)", { h: 120, s: 100, v: 50 }],
        ["hsv(240, 100%, 50%)", { h: 240, s: 100, v: 50 }],

        // Different spacing
        ["hsv( 180 , 50% , 75% )", { h: 180, s: 50, v: 75 }],
        ["hsv(90,25%,60%)", { h: 90, s: 25, v: 60 }],

        // Valid range values
        ["hsv(359, 50%, 50%)", { h: 359, s: 50, v: 50 }],
        ["hsv(0, 100%, 0%)", { h: 0, s: 100, v: 0 }],
        ["hsv(0, 0%, 100%)", { h: 0, s: 0, v: 100 }],

        // Normalization cases - values outside 0-359 become 0
        ["hsv(360, 50%, 50%)", { h: 0, s: 50, v: 50 }],
        ["hsv(361, 50%, 50%)", { h: 0, s: 50, v: 50 }],
        ["hsv(720, 50%, 50%)", { h: 0, s: 50, v: 50 }],
        ["hsv(-1, 50%, 50%)", { h: 0, s: 50, v: 50 }],
        ["hsv(-60, 50%, 50%)", { h: 0, s: 50, v: 50 }],

        // Saturation and value clamping
        ["hsv(120, 150%, 50%)", { h: 120, s: 100, v: 50 }],
        ["hsv(120, -10%, 50%)", { h: 120, s: 0, v: 50 }],
        ["hsv(120, 50%, 150%)", { h: 120, s: 50, v: 100 }],
        ["hsv(120, 50%, -10%)", { h: 120, s: 50, v: 0 }]
      ];

      testValidHsvCases(validHsvCases);
    });

    describe("Invalid HSV formats", () => {
      const invalidHsvCases = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsv(120, 50%)",
        "hsv(120)",
        "hsv()",
        "hsv(120, 50, 50)",
        "hsv(120deg, 50%, 50%)",
        "hsv(red, 50%, 50%)"
      ];

      testInvalidHsvCases(invalidHsvCases);
    });

    describe("Console warnings", () => {
      const validHsvInputs = [
        "hsv(0, 0%, 0%)",
        "hsv(120, 50%, 50%)",
        "hsv( 180 , 50% , 75% )",
        "hsv(360, 50%, 50%)",
        "hsv(-60, 50%, 50%)",
        "hsv(720, 150%, -10%)"
      ];

      const invalidHsvInputs = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsv(120, 50%)",
        "hsv(120)",
        "hsv()",
        "hsv(120, 50, 50)",
        "hsv(red, 50%, 50%)"
      ];

      testHsvConsoleWarnings(false, validHsvInputs);
      testHsvConsoleWarnings(true, invalidHsvInputs);
    });
  });

  describe("fromHsvStringToRgbColor", () => {
    describe("Valid HSV to RGB conversion", () => {
      const validHsvToRgbCases = [
        // Basic colors
        ["hsv(0, 0%, 0%)", { r: 0, g: 0, b: 0 }],
        ["hsv(0, 0%, 100%)", { r: 255, g: 255, b: 255 }],
        ["hsv(0, 100%, 100%)", { r: 255, g: 0, b: 0 }], // Red
        ["hsv(120, 100%, 100%)", { r: 0, g: 255, b: 0 }], // Green
        ["hsv(240, 100%, 100%)", { r: 0, g: 0, b: 255 }], // Blue

        // Secondary colors
        ["hsv(60, 100%, 100%)", { r: 255, g: 255, b: 0 }], // Yellow
        ["hsv(180, 100%, 100%)", { r: 0, g: 255, b: 255 }], // Cyan
        ["hsv(300, 100%, 100%)", { r: 255, g: 0, b: 255 }], // Magenta

        // Grays (0% saturation)
        ["hsv(0, 0%, 50%)", { r: 128, g: 128, b: 128 }],
        ["hsv(120, 0%, 75%)", { r: 191, g: 191, b: 191 }],

        // Mid-saturation colors
        ["hsv(0, 50%, 100%)", { r: 255, g: 128, b: 128 }],
        ["hsv(120, 50%, 100%)", { r: 128, g: 255, b: 128 }],
        ["hsv(240, 50%, 100%)", { r: 128, g: 128, b: 255 }],

        // Different values
        ["hsv(0, 100%, 50%)", { r: 128, g: 0, b: 0 }],
        ["hsv(120, 100%, 50%)", { r: 0, g: 128, b: 0 }],
        ["hsv(240, 100%, 50%)", { r: 0, g: 0, b: 128 }],

        // Normalization cases - all out-of-range hues become 0 (red)
        ["hsv(360, 100%, 100%)", { r: 255, g: 0, b: 0 }],
        ["hsv(361, 100%, 100%)", { r: 255, g: 0, b: 0 }],
        ["hsv(-1, 100%, 100%)", { r: 255, g: 0, b: 0 }],
        ["hsv(-60, 100%, 100%)", { r: 255, g: 0, b: 0 }],

        // Saturation/value clamping
        ["hsv(120, 150%, 100%)", { r: 0, g: 255, b: 0 }], // S clamped to 100%
        ["hsv(120, -10%, 100%)", { r: 255, g: 255, b: 255 }], // S clamped to 0%
        ["hsv(120, 50%, 150%)", { r: 128, g: 255, b: 128 }], // V clamped to 100%
        ["hsv(120, 50%, -10%)", { r: 0, g: 0, b: 0 }] // V clamped to 0%
      ];

      testValidHsvToRgbCases(validHsvToRgbCases);
    });

    describe("Invalid HSV inputs", () => {
      const invalidHsvToRgbCases = [
        "invalid-color",
        "",
        "#ff0000",
        "hsv(120, 50%)",
        "hsv()",
        "rgb(255, 0, 0)"
      ];

      testInvalidHsvToRgbCases(invalidHsvToRgbCases);
    });

    describe("Console warnings", () => {
      const validHsvInputs = [
        "hsv(0, 100%, 50%)",
        "hsv(360, 100%, 50%)",
        "hsv(-60, 100%, 50%)",
        "hsv(120, 150%, -10%)"
      ];

      const invalidHsvInputs = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsv(120, 50%)",
        "hsv(red, 50%, 50%)"
      ];

      testHsvToRgbConsoleWarnings(false, validHsvInputs);
      testHsvToRgbConsoleWarnings(true, invalidHsvInputs);
    });
  });
});
