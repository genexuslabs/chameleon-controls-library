import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-checkbox][form][checkbox]", () => {
  performFormTests({
    formElementTagName: "ch-checkbox",
    hasReadonlySupport: false
  });
});
