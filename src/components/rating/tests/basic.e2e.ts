import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { testDefaultProperties } from "../../../testing/utils.e2e";

testDefaultProperties("ch-rating", {
  accessibleName: undefined,
  disabled: false,
  name: undefined,
  stars: 5,
  step: 1,
  value: 0
});

describe("[ch-rating][basic]", () => {
  let page: E2EPage;
  let ratingRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-rating></ch-rating>`,
      failOnConsoleError: true
    });
    ratingRef = await page.find("ch-rating");
  });

  it("should have Shadow DOM", () => expect(ratingRef.shadowRoot).toBeTruthy());
});
