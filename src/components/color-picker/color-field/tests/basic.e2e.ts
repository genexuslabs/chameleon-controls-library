import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  testDefaultCssProperties,
  testDefaultProperties
} from "../../../../testing/utils.e2e";

testDefaultProperties("ch-color-field", {
  disabled: false,
  readonly: false,
  step: 1,
  accessibleName: "Color field",
  accessibleRoleDescription: "2D color field",
  value: "#000"
});

testDefaultCssProperties("ch-color-field", {
  contain: "size",
  display: "block",
  position: "relative"
});

describe("[ch-color-field][basic]", () => {
  let page: E2EPage;
  let colorFieldElement: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-color-field></ch-color-field>`,
      failOnConsoleError: true
    });
    colorFieldElement = await page.find("ch-color-field");
  });

  it("should have Shadow DOM", () =>
    expect(colorFieldElement.shadowRoot).toBeTruthy());
});
