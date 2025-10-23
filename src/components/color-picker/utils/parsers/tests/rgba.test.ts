import { fromRgbaStringToRgbaColor } from "../rgba";

describe("RGBA Color Functions", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Helper function to test valid cases
  const testValidRgbaCases = testCases => {
    test.each(testCases)(
      "should parse RGBA %s correctly",
      (input, expected) => {
        expect(fromRgbaStringToRgbaColor(input)).toEqual(expected);
      }
    );
  };

  // Helper function to test invalid cases
  const testInvalidRgbaCases = testCases => {
    test.each(testCases)("should return null for invalid RGBA: %s", input => {
      expect(fromRgbaStringToRgbaColor(input)).toBeNull();
    });
  };

  // Function to test console warnings for RGBA
  const testRgbaConsoleWarnings = (shouldWarn, testCases) => {
    test.each(testCases)(
      `should ${shouldWarn ? "" : "not "}log warning for RGBA: %s`,
      input => {
        fromRgbaStringToRgbaColor(input);

        if (shouldWarn) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }
      }
    );
  };

  describe("fromRgbaStringToRgba", () => {
    describe("Valid RGB/RGBA formats", () => {
      const validRgbaCases = [
        // Basic RGB
        ["rgb(255, 0, 0)", { r: 255, g: 0, b: 0, a: 1 }],
        ["rgb(0, 255, 128)", { r: 0, g: 255, b: 128, a: 1 }],
        ["rgb(0, 0, 0)", { r: 0, g: 0, b: 0, a: 1 }],
        ["rgb(255, 255, 255)", { r: 255, g: 255, b: 255, a: 1 }],

        // RGB with different spacing
        ["rgb( 128 , 64 , 192 )", { r: 128, g: 64, b: 192, a: 1 }],
        ["rgb(0,255,128)", { r: 0, g: 255, b: 128, a: 1 }],

        // Basic RGBA
        ["rgba(255, 0, 0, 0.5)", { r: 255, g: 0, b: 0, a: 0.5 }],
        ["rgba(255, 0, 0, 1.0)", { r: 255, g: 0, b: 0, a: 1.0 }],
        ["rgba(100, 200, 50, 0)", { r: 100, g: 200, b: 50, a: 0 }],
        ["rgba(255, 255, 255, 0.01)", { r: 255, g: 255, b: 255, a: 0.01 }],
        ["rgba(50, 100, 150, 0.123)", { r: 50, g: 100, b: 150, a: 0.123 }],

        // RGBA with dot formats
        ["rgba(255, 0, 0, .5)", { r: 255, g: 0, b: 0, a: 0.5 }],
        ["rgba(100, 150, 200, .75)", { r: 100, g: 150, b: 200, a: 0.75 }],
        ["rgba(255, 255, 255, .01)", { r: 255, g: 255, b: 255, a: 0.01 }],
        ["rgba(200, 100, 50, .999)", { r: 200, g: 100, b: 50, a: 0.999 }],

        // RGBA with trailing dot
        ["rgba(255, 0, 0, 1.)", { r: 255, g: 0, b: 0, a: 1 }],
        ["rgba(100, 100, 100, 0.)", { r: 100, g: 100, b: 100, a: 0 }],

        // RGBA with spacing
        ["rgba( 64 , 128 , 192 , 0.75 )", { r: 64, g: 128, b: 192, a: 0.75 }],
        ["rgba( 64 , 128 , 192 , .75 )", { r: 64, g: 128, b: 192, a: 0.75 }],
        ["rgba( 64 , 128 , 192 , 1. )", { r: 64, g: 128, b: 192, a: 1 }],

        // Clamping cases - values outside range get clamped
        ["rgb(300, 0, 0)", { r: 255, g: 0, b: 0, a: 1 }], // R clamped to 255
        ["rgb(0, 300, 0)", { r: 0, g: 255, b: 0, a: 1 }], // G clamped to 255
        ["rgb(0, 0, 300)", { r: 0, g: 0, b: 255, a: 1 }], // B clamped to 255
        ["rgb(-10, 0, 0)", { r: 0, g: 0, b: 0, a: 1 }], // R clamped to 0
        ["rgb(0, -10, 0)", { r: 0, g: 0, b: 0, a: 1 }], // G clamped to 0
        ["rgb(0, 0, -10)", { r: 0, g: 0, b: 0, a: 1 }], // B clamped to 0
        ["rgba(255, 0, 0, 1.5)", { r: 255, g: 0, b: 0, a: 1 }], // Alpha clamped to 1
        ["rgba(255, 0, 0, -0.5)", { r: 255, g: 0, b: 0, a: 0 }], // Alpha clamped to 0
        ["rgb(1000, -50, 300)", { r: 255, g: 0, b: 255, a: 1 }] // Multiple clamping
      ];

      testValidRgbaCases(validRgbaCases);
    });

    describe("Invalid RGB/RGBA formats", () => {
      const invalidRgbaCases = [
        // Completely invalid
        "invalid-color",
        "",
        "#ff0000",
        "hsl(0, 100%, 50%)",

        // Missing parts
        "rgb(255, 0)",
        "rgb(255)",
        "rgb()",

        // Malformed
        "rgb(255, 0, 0", // Missing closing paren
        "rgb255, 0, 0)", // Missing opening paren
        "rgb(red, green, blue)", // Non-numeric values

        // Invalid alpha formats
        "rgba(255, 0, 0, .)", // Invalid alpha
        "rgba(255, 0, 0, 1.2.3)", // Invalid alpha
        "rgba(255, 0, 0, abc)", // Invalid alpha
        "rgba(255, 0, 0, .abc)" // Invalid alpha
      ];

      testInvalidRgbaCases(invalidRgbaCases);
    });

    describe("Console warnings", () => {
      const validRgbaInputs = [
        "rgb(255, 0, 0)",
        "rgba(255, 0, 0, 0.5)",
        "rgba(255, 0, 0, .5)",
        "rgba(255, 0, 0, 1.)",
        "rgb(300, 0, 0)", // Clamping cases don't warn
        "rgba(255, 0, 0, 1.5)" // Clamping cases don't warn
      ];

      const invalidRgbaInputs = [
        "invalid-color",
        "rgba(255, 0, 0, .)",
        "rgb(red, green, blue)",
        "rgb(255, 0)"
      ];

      testRgbaConsoleWarnings(false, validRgbaInputs);
      testRgbaConsoleWarnings(true, invalidRgbaInputs);
    });
  });
});
