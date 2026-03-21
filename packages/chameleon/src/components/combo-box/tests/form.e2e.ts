import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-combo-box-render][form][combo-box]", () => {
  performFormTests(
    {
      formElementTagName: "ch-combo-box-render",
      hasReadonlySupport: false
      // hasTextSelectionSupport: false
    },
    ".input-container"
  );
});

describe("[ch-combo-box-render][form][suggest]", () => {
  performFormTests(
    {
      formElementTagName: "ch-combo-box-render",
      additionalAttributes: 'suggest suggest-debounce="0"',
      hasReadonlySupport: false,
      // hasTextSelectionSupport: false,
      pressEnterToConfirmValue: true,
      valueCanBeUpdatedByTheUser: true
    },
    "input",
    ".input-container"
  );
});
