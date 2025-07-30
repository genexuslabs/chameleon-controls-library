import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { getAllShadowRootAncestors } from "../get-all-root-nodes";

const COMPLEX_CASE = `<ch-tabular-grid class="property-grid">
  <ch-tabular-grid-columnset class="property-grid-column-set">
    <ch-tabular-grid-column
      column-name="Property"
      settingable="false"
      size="50%"
      class="property-grid-column"
    ></ch-tabular-grid-column>
    <ch-tabular-grid-column
      column-name="Value"
      settingable="false"
      size="minmax(auto, calc(100% - var(--ch-tabular-grid-column-1-width)))"
      class="property-grid-column"
    ></ch-tabular-grid-column>
  </ch-tabular-grid-columnset>

  <ch-tabular-grid-row class="property-grid-row property-grid-value-editing">
    <ch-tabular-grid-cell class="property-grid-cell"
      >Combo Box</ch-tabular-grid-cell
    >
    <ch-tabular-grid-cell class="property-grid-cell">
      <ch-combo-box-render
        accessible-name="Colors"
        id="combo-box-1"
        class="combo-box"
      ></ch-combo-box-render>
    </ch-tabular-grid-cell>
  </ch-tabular-grid-row>
  <ch-tabular-grid-row class="property-grid-row property-grid-value-editing">
    <ch-tabular-grid-cell class="property-grid-cell"
      >Form Input</ch-tabular-grid-cell
    >
    <ch-tabular-grid-cell class="property-grid-cell">
      <input type="text" placeholder="Enter your name" class="input" />
    </ch-tabular-grid-cell>
  </ch-tabular-grid-row>
</ch-tabular-grid>`;

describe("[get-all-root-nodes]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage({
      html: "",
      failOnConsoleError: true
    });
  });

  // TODO: Implement this e2e tests with playwright
  it.skip("should return all root nodes including shadow roots", async () => {
    await page.setContent(COMPLEX_CASE);
    await page.waitForChanges();

    expect(
      getAllShadowRootAncestors(document.querySelector("ch-combo-box-render"))
    ).toBe([]);
  });
});
