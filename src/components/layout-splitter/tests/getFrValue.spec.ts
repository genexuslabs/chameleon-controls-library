import { getFrValue } from "../utils";

describe("[ch-layout-splitter] [getFrValue]", () => {
  const values = [1, -1, 0.5, -0.5, 0.33, -0.33, 80, -80];

  values.forEach(value => {
    it("should get the correct fr value", async () => {
      const frValue = getFrValue({
        id: "any",
        size: `${value}fr`
      });

      expect(frValue).toEqual(value);
    });
  });
});
