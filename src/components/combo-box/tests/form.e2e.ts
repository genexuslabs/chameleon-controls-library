import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-combo-box-render][form][combo-box]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    hasReadonlySupport: false,
    focusIsOnHostElement: true
  });
});

// TODO: Fix failed test
describe.skip("[ch-combo-box-render][form][suggest]", () => {
  performFormTests({
    formElementTagName: "ch-combo-box-render",
    additionalAttributes: "suggest",
    hasReadonlySupport: false,
    pressEnterToConfirmValue: true,
    valueCanBeUpdatedByTheUser: true
  });
});
