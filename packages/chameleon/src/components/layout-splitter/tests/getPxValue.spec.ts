import { getPxValue } from "../utils";

describe("[ch-layout-splitter] [getPxValue]", () => {
  const values = [1, -1, 0.5, -0.5, 0.33, -0.33, 80, -80];

  values.forEach(value => {
    it("should get the correct px value (size)", async () => {
      const pxValue = getPxValue(
        {
          id: "any",
          size: `${value}px`
        },
        "size"
      );

      expect(pxValue).toEqual(value);
    });
  });

  values.forEach(value => {
    it("should get the correct px value (minSize)", async () => {
      const pxValue = getPxValue(
        {
          id: "any",
          size: `0.7px`,
          minSize: `${value}px`
        },
        "min"
      );

      expect(pxValue).toEqual(value);
    });
  });
});
