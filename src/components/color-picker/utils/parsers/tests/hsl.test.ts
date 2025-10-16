import { fromHslStringToHslColor, fromHslStringToRgbaColor } from "../hsl";

describe("HSL Color Functions", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid hsl strings cases
  const testValidHslCases = testCases => {
    test.each(testCases)("should parse HSL %s correctly", (input, expected) => {
      expect(fromHslStringToHslColor(input)).toEqual(expected);
    });
  };

  // Helper function to test invalid cases
  const testInvalidHslCases = testCases => {
    test.each(testCases)("should return null for invalid HSL: %s", input => {
      expect(fromHslStringToHslColor(input)).toBeNull();
    });
  };

  // Helper function to test valid hsla string cases
  const testValidHslaToRgbaCases = testCases => {
    test.each(testCases)(
      "should convert HSLA %s to RGBA correctly",
      (input, expected) => {
        const result = fromHslStringToRgbaColor(input);
        expect(result).toEqual(expected);
      }
    );
  };

  // Helper function to test invalid hsla string cases
  const testInvalidHslaToRgbaCases = testCases => {
    test.each(testCases)("should return null for invalid HSLA: %s", input => {
      expect(fromHslStringToRgbaColor(input)).toBeNull();
    });
  };

  // Function to test console warnings for HSL
  const testHslConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for HSL: %s`,
      input => {
        fromHslStringToHslColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  // Function to test console warnings for HSLA to RGBA
  const testHslaConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for HSLA: %s`,
      input => {
        fromHslStringToRgbaColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromStringToHslColor", () => {
    describe("Valid HSL formats", () => {
      const validHslCases = [
        // Basic HSL
        ["hsl(0, 0%, 0%)", { h: 0, s: 0, l: 0 }],
        ["hsl(0, 0%, 100%)", { h: 0, s: 0, l: 100 }],
        ["hsl(0, 100%, 50%)", { h: 0, s: 100, l: 50 }],
        ["hsl(120, 100%, 50%)", { h: 120, s: 100, l: 50 }],
        ["hsl(240, 100%, 50%)", { h: 240, s: 100, l: 50 }],

        // Different spacing
        ["hsl( 180 , 50% , 75% )", { h: 180, s: 50, l: 75 }],
        ["hsl(90,25%,60%)", { h: 90, s: 25, l: 60 }],

        // Valid range values
        ["hsl(359, 50%, 50%)", { h: 359, s: 50, l: 50 }],
        ["hsl(0, 100%, 0%)", { h: 0, s: 100, l: 0 }],
        ["hsl(0, 0%, 100%)", { h: 0, s: 0, l: 100 }],

        // Normalization cases - values outside 0-359 become 0
        ["hsl(360, 50%, 50%)", { h: 0, s: 50, l: 50 }],
        ["hsl(361, 50%, 50%)", { h: 0, s: 50, l: 50 }],
        ["hsl(720, 50%, 50%)", { h: 0, s: 50, l: 50 }],
        ["hsl(-1, 50%, 50%)", { h: 0, s: 50, l: 50 }],
        ["hsl(-60, 50%, 50%)", { h: 0, s: 50, l: 50 }],

        // Saturation and lightness clamping
        ["hsl(120, 150%, 50%)", { h: 120, s: 100, l: 50 }],
        ["hsl(120, -10%, 50%)", { h: 120, s: 0, l: 50 }],
        ["hsl(120, 50%, 150%)", { h: 120, s: 50, l: 100 }],
        ["hsl(120, 50%, -10%)", { h: 120, s: 50, l: 0 }]
      ];

      testValidHslCases(validHslCases);
    });

    describe("Invalid HSL formats", () => {
      const invalidHslCases = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsl(120, 50%)",
        "hsl(120)",
        "hsl()",
        "hsl(120, 50, 50)",
        "hsl(120deg, 50%, 50%)",
        "hsl(red, 50%, 50%)"
      ];

      testInvalidHslCases(invalidHslCases);
    });

    describe("Console warnings", () => {
      const validHslInputs = [
        "hsl(0, 0%, 0%)",
        "hsl(120, 50%, 50%)",
        "hsl( 180 , 50% , 75% )",
        "hsl(360, 50%, 50%)", // Gets normalized but doesn't warn
        "hsl(-60, 50%, 50%)", // Gets normalized but doesn't warn
        "hsl(720, 150%, -10%)" // Gets clamped but doesn't warn
      ];

      const invalidHslInputs = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsl(120, 50%)",
        "hsl(120)",
        "hsl()",
        "hsl(120, 50, 50)",
        "hsl(red, 50%, 50%)"
      ];

      testHslConsoleWarnings(false, validHslInputs);
      testHslConsoleWarnings(true, invalidHslInputs);
    });
  });

  describe("fromStringToRgbaColor", () => {
    describe("Valid HSL/HSLA to RGBA conversion", () => {
      const validHslaToRgbaCases = [
        // Basic colors
        ["hsl(0, 0%, 0%)", { r: 0, g: 0, b: 0, a: 1 }],
        ["hsl(0, 0%, 100%)", { r: 255, g: 255, b: 255, a: 1 }],
        ["hsl(0, 100%, 50%)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsl(120, 100%, 50%)", { r: 0, g: 255, b: 0, a: 1 }],
        ["hsl(240, 100%, 50%)", { r: 0, g: 0, b: 255, a: 1 }],

        // HSLA with alpha
        ["hsla(0, 100%, 50%, 0.5)", { r: 255, g: 0, b: 0, a: 0.5 }],
        ["hsla(120, 100%, 50%, 0.8)", { r: 0, g: 255, b: 0, a: 0.8 }],
        ["hsla(0, 100%, 50%, 1.)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsla(0, 100%, 50%, .5)", { r: 255, g: 0, b: 0, a: 0.5 }],

        // Normalization cases - all out-of-range hues become 0 (red)
        ["hsl(360, 100%, 50%)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsl(361, 100%, 50%)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsl(-1, 100%, 50%)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsl(-60, 100%, 50%)", { r: 255, g: 0, b: 0, a: 1 }],

        // Alpha clamping
        ["hsla(0, 100%, 50%, 1.5)", { r: 255, g: 0, b: 0, a: 1 }],
        ["hsla(0, 100%, 50%, -0.5)", { r: 255, g: 0, b: 0, a: 0 }],

        // Saturation/lightness clamping
        ["hsl(120, 150%, 50%)", { r: 0, g: 255, b: 0, a: 1 }],
        ["hsl(120, -10%, 50%)", { r: 128, g: 128, b: 128, a: 1 }]
      ];

      testValidHslaToRgbaCases(validHslaToRgbaCases);
    });

    describe("Invalid HSLA inputs", () => {
      const invalidHslaToRgbaCases = [
        "invalid-color",
        "",
        "#ff0000",
        "hsl(120, 50%)",
        "hsla(120, 50%, 50%, abc)"
      ];

      testInvalidHslaToRgbaCases(invalidHslaToRgbaCases);
    });

    describe("Console warnings", () => {
      const validHslaInputs = [
        "hsl(0, 100%, 50%)",
        "hsla(120, 50%, 50%, 0.8)",
        "hsla(0, 100%, 50%, 1.)",
        "hsla(0, 100%, 50%, .5)",
        "hsla(0, 100%, 50%, 0.123)",
        "hsl(360, 100%, 50%)", // Gets normalized but doesn't warn
        "hsl(-60, 100%, 50%)", // Gets normalized but doesn't warn
        "hsla(0, 100%, 50%, 1.5)", // Gets clamped but doesn't warn
        "hsl(120, 150%, -10%)" // Gets clamped but doesn't warn
      ];

      const invalidHslaInputs = [
        "invalid-color",
        "",
        "#ff0000",
        "rgb(255, 0, 0)",
        "hsl(120, 50%)",
        "hsla(120, 50%, 50%, .)", // Invalid alpha
        "hsla(120, 50%, 50%, abc)", // Invalid alpha
        "hsl(red, 50%, 50%)"
      ];

      testHslaConsoleWarnings(false, validHslaInputs);
      testHslaConsoleWarnings(true, invalidHslaInputs);
    });

    describe("Alpha handling", () => {
      test("should default alpha to 1 for HSL format", () => {
        const result = fromHslStringToRgbaColor("hsl(120, 50%, 50%)");
        expect(result?.a).toBe(1);
      });

      test("should use provided alpha for HSLA format", () => {
        const result = fromHslStringToRgbaColor("hsla(120, 50%, 50%, 0.7)");
        expect(result?.a).toBe(0.7);
      });
    });
  });
});
