import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-slider][form][slider]", () => {
  performFormTests({
    formElementTagName: "ch-slider",
    hasReadonlySupport: false,
    valueIsNumeric: true
  });
});
