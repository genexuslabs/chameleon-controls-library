import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-combo-box-render][form]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    hasReadonlySupport: false,
    focusIsOnHostElement: true
  });
});

describe("[ch-combo-box-render][form][suggest]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    additionalAttributes: "filter-type='caption'",
    hasReadonlySupport: false,
    pressEnterToConfirmValue: true,
    valueCanBeUpdatedByTheUser: true
  });
});
