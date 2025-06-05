import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-edit", {
  accessibleName: undefined,
  autocapitalize: undefined,
  autocomplete: "off",
  autoFocus: false,
  autoGrow: false,
  clearSearchButtonAccessibleName: "Clear search",
  debounce: 0,
  disabled: false,
  getImagePathCallback: undefined,
  hostParts: undefined,
  maxLength: undefined,
  mode: undefined,
  multiline: false,
  name: undefined,
  pattern: undefined,
  picture: undefined,
  pictureCallback: undefined,
  placeholder: undefined,
  readonly: false,
  showAdditionalContentAfter: false,
  showAdditionalContentBefore: false,
  showPassword: false,
  spellcheck: false,
  startImgSrc: undefined,
  startImgType: "background",
  type: "text",
  value: undefined
});

describe("[ch-edit][basic]", () => {
  let page: E2EPage;
  let editRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-edit></ch-edit>`,
      failOnConsoleError: true
    });

    editRef = await page.find("ch-edit");
  });

  it("should have Shadow DOM", () => expect(editRef.shadowRoot).toBeTruthy());
});
