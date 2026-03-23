import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
// import { testDefaultProperties } from "../../../../../testing/utils.e2e";

// testDefaultProperties("ch-infinite-scroll", {
//   dataProvider: false,
//   disabled: false,
//   infiniteThresholdReachedCallback: undefined,
//   loadingState: undefined,
//   position: "bottom",
//   threshold: "150px"
// });

describe.skip("[ch-infinite-scroll][basic]", () => {
  let page: E2EPage;
  let infiniteScrollRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-infinite-scroll></ch-infinite-scroll>`,
      failOnConsoleError: true
    });

    infiniteScrollRef = await page.find("ch-infinite-scroll");
  });

  it("should have Shadow DOM", () =>
    expect(infiniteScrollRef.shadowRoot).toBeTruthy());
});
