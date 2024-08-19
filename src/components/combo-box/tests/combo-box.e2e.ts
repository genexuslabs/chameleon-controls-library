import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-combo-box-render][form]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    hasReadonlySupport: false
  });
});

describe("[ch-combo-box-render][form][suggest]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    hasReadonlySupport: false,
    additionalAttributes: "filter-type='caption'",
    pressEnterToConfirmValue: true
  });
});
