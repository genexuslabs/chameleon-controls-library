import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-switch][form][switch]", () => {
  performFormTests({
    formElementTagName: "ch-switch",
    hasReadonlySupport: false
  });
});
