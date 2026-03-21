import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";

describe("[ch-combo-box-render][styling]", () => {
  let page: E2EPage;
  let comboBoxRef: E2EElement;
  let comboBoxDivRef: E2EElement;
  let inputRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-combo-box-render></ch-combo-box-render>`,
      failOnConsoleError: true
    });
    comboBoxRef = await page.find("ch-combo-box-render");
    comboBoxDivRef = await page.find(
      "ch-combo-box-render >>> [role='combobox']"
    );
    inputRef = await page.find("ch-combo-box-render >>> input");
    await comboBoxRef.setProperty("model", simpleModelComboBox1);
    await page.waitForChanges();
  });

  it('the Host should have "cursor: pointer" by default', async () => {
    expect((await comboBoxRef.getComputedStyle()).cursor).toEqual("pointer");
  });

  it('the div (role="combobox") should have "cursor: pointer" by default', async () => {
    expect((await comboBoxDivRef.getComputedStyle()).cursor).toEqual("pointer");
  });

  it('the inner input should have "pointer-events: none" by default', async () => {
    expect((await inputRef.getComputedStyle()).pointerEvents).toEqual("none");
  });

  it('the ch-popover should have "cursor: initial" by default', async () => {
    await comboBoxRef.click();
    await page.waitForChanges();
    const popoverRef = await page.find("ch-combo-box-render >>> ch-popover");

    const computedStyle = await popoverRef.getComputedStyle();
    expect(computedStyle.cursor).toEqual("auto");
  });

  it('the Host should have "cursor: text" when suggest = true', async () => {
    await comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();
    expect((await comboBoxRef.getComputedStyle()).cursor).toEqual("text");
  });

  it('the div (role="combobox") should have "cursor: text" when suggest = true', async () => {
    await comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();
    expect((await comboBoxDivRef.getComputedStyle()).cursor).toEqual("text");
  });

  it('the inner input not should have "pointer-events: none" when suggest = true', async () => {
    await comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();
    expect((await inputRef.getComputedStyle()).pointerEvents).toEqual("auto");
  });

  it('the ch-popover should have "cursor: initial" when suggest = true', async () => {
    await comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();
    await comboBoxRef.press("H");
    await page.waitForChanges();
    const popoverRef = await page.find("ch-combo-box-render >>> ch-popover");

    const computedStyle = await popoverRef.getComputedStyle();
    expect(computedStyle.cursor).toEqual("auto");
  });
});
