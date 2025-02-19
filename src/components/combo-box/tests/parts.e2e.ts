import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  dataTypeInGeneXus,
  simpleModelComboBox1
} from "../../../showcase/assets/components/combo-box/models";

const EMPTY_VALUE_PART = "ch-combo-box-render--placeholder";
const DUMMY_VALUE = "Hello world";
const VALID_VALUE = "_Audio";

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

  it(`[default] should set the "${EMPTY_VALUE_PART}" part in the Host by default`, async () => {
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[default] should set the "${EMPTY_VALUE_PART}" part in the Host, even if the model has items`, async () => {
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[default] should set the "${EMPTY_VALUE_PART}" part in the Host, even if the model has items but the value does not match a valid item`, async () => {
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    comboBoxRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[default] should set the "${EMPTY_VALUE_PART}" part in the Host, when the value is set but the model is undefined`, async () => {
    comboBoxRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[default] should not set the "${EMPTY_VALUE_PART}" part in the Host, when the value matches a valid item`, async () => {
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    comboBoxRef.setProperty("value", VALID_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });

  it(`[default] should set again the "${EMPTY_VALUE_PART}" part in the Host, when the value is matches a valid item and then is updated to undefined`, async () => {
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    comboBoxRef.setProperty("value", VALID_VALUE);
    await page.waitForChanges();

    comboBoxRef.setProperty("value", undefined);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should set the "${EMPTY_VALUE_PART}" part in the Host by default`, async () => {
    comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should set the "${EMPTY_VALUE_PART}" part in the Host, even if the model has items`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should not set the "${EMPTY_VALUE_PART}" part in the Host, when the value is set with an invalid item and the model is undefined`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should not set the "${EMPTY_VALUE_PART}" part in the Host, when the value is set with a valid item and the model is undefined`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("value", VALID_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should not set the "${EMPTY_VALUE_PART}" part in the Host, when the value is set with an invalid item and the model is defined`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    comboBoxRef.setProperty("value", DUMMY_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should not set the "${EMPTY_VALUE_PART}" part in the Host, when the value is set with a valid item and the model is defined`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("model", dataTypeInGeneXus);
    comboBoxRef.setProperty("value", VALID_VALUE);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });

  it(`[suggest] should set again the "${EMPTY_VALUE_PART}" part in the Host, when the value is defined and then is updated to undefined`, async () => {
    comboBoxRef.setProperty("suggest", true);
    comboBoxRef.setProperty("value", VALID_VALUE);
    await page.waitForChanges();

    comboBoxRef.setProperty("value", undefined);
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).toContain(EMPTY_VALUE_PART);
  });

  // TODO: This should work even with the suggestDebounce
  it.skip(`[suggest] should remove the "${EMPTY_VALUE_PART}" part in the Host, when the user types a character`, async () => {
    comboBoxRef.setProperty("suggest", true);
    await page.waitForChanges();
    await comboBoxRef.press("A");
    await page.waitForChanges();

    comboBoxRef = await page.find("ch-combo-box-render"); // Refresh the reference
    expect(comboBoxRef.getAttribute("part")).not.toContain(EMPTY_VALUE_PART);
  });
});
