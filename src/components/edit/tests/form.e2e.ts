import { performFormTests } from "../../../testing/form.e2e";

describe("[ch-edit][form][multiline = false]", () => {
  performFormTests({
    formElementTagName: "ch-edit",
    hasReadonlySupport: true,
    hasAutoFocusSupport: true,
    valueCanBeUpdatedByTheUser: true
  });
});

// TODO: Fix falling tests
// describe("[ch-edit][form][multiline = true]", () => {
//   performFormTests(
//     {
//       formElementTagName: "ch-edit",
//       hasReadonlySupport: true,
//       hasAutoFocusSupport: true,
//       additionalAttributes: "multiline"
//     },
//     "textarea"
//   );
// });
