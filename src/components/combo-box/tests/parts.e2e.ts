import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";

describe("[ch-combo-box-render][parts]", () => {
  let page: E2EPage;
  let comboBoxRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<button>Dummy button</button>
      <ch-combo-box-render></ch-combo-box-render>`,
      failOnConsoleError: true
    });
    comboBoxRef = await page.find("ch-combo-box-render");
    await comboBoxRef.setProperty("model", simpleModelComboBox1);
    await page.waitForChanges();
  });

  it('should set the "expandable" part only for the expandable groups', async () => {
    await page.click("ch-combo-box-render");
    await page.waitForChanges();

    const alwaysExpandedSpanRef = await page.find(
      "ch-combo-box-render >>> [aria-labelledby='1'] > span"
    );
    expect(alwaysExpandedSpanRef.getAttribute("part")).not.toContain(
      "expandable"
    );

    const expandedButtonRef = await page.find(
      "ch-combo-box-render >>> [aria-labelledby='5'] > button"
    );
    expect(expandedButtonRef.getAttribute("part")).toContain("expandable");

    const collapsedButtonRef = await page.find(
      "ch-combo-box-render >>> [aria-labelledby='8'] > button"
    );
    expect(collapsedButtonRef.getAttribute("part")).toContain("expandable");
  });

  it('should set the "expanded"/"collapsed" parts when there are expandable groups', async () => {
    await page.click("ch-combo-box-render");
    await page.waitForChanges();

    const expandedButtonRef = await page.find(
      "ch-combo-box-render >>> [aria-labelledby='5'] > button"
    );
    expect(expandedButtonRef.getAttribute("part")).toContain("expanded");
    expect(expandedButtonRef.getAttribute("part")).not.toContain("collapsed");

    const collapsedButtonRef = await page.find(
      "ch-combo-box-render >>> [aria-labelledby='8'] > button"
    );
    expect(collapsedButtonRef.getAttribute("part")).not.toContain("expanded");
    expect(collapsedButtonRef.getAttribute("part")).toContain("collapsed");
  });
});
