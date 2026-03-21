import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { TabListPosition, TabModel } from "../types";

const simpleModel1: TabModel = [
  { id: "item1", name: "Item 1" },
  { id: "item2", name: "Item 2" },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "Item 4" }
];

const TAB_LIST_WIDTH = "300px";
const TAB_LIST_HEIGHT = "350px";
const TAB_LIST_START_END_WIDTH = "50px";
const TAB_LIST_START_END_HEIGHT = "20px";

const TAB_LIST_WIDTH_ONE_SLOT = "250px";
const TAB_LIST_HEIGHT_ONE_SLOT = "330px";

const TAB_LIST_WIDTH_TWO_SLOTS = "200px";
const TAB_LIST_HEIGHT_TWO_SLOTS = "310px";

const getTabListWidth = (
  projectingTabListStart: boolean,
  projectingTabListEnd: boolean
) => {
  if (!projectingTabListStart && !projectingTabListEnd) {
    return TAB_LIST_WIDTH;
  }

  return projectingTabListStart && projectingTabListEnd
    ? TAB_LIST_WIDTH_TWO_SLOTS
    : TAB_LIST_WIDTH_ONE_SLOT;
};

const getTabListHeight = (
  projectingTabListStart: boolean,
  projectingTabListEnd: boolean
) => {
  if (!projectingTabListStart && !projectingTabListEnd) {
    return TAB_LIST_HEIGHT;
  }

  return projectingTabListStart && projectingTabListEnd
    ? TAB_LIST_HEIGHT_TWO_SLOTS
    : TAB_LIST_HEIGHT_ONE_SLOT;
};

const tabListPositionValues: TabListPosition[] = [
  "block-start",
  "block-end",
  "inline-start",
  "inline-end"
];
const showTabListStartValues = [false, true];
const showTabListEndValues = [false, true];

const runTestsForFunction = (
  fn: (
    tabListPosition: TabListPosition,
    showTabListStart: boolean,
    showTabListEnd: boolean
  ) => void
) =>
  tabListPositionValues.forEach(tabListPosition =>
    showTabListStartValues.forEach(showTabListStart =>
      showTabListEndValues.forEach(showTabListEnd =>
        fn(tabListPosition, showTabListStart, showTabListEnd)
      )
    )
  );

describe.skip("[ch-tab-render][tab-list][without slots]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;
  let tabListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tab-render style="width: ${TAB_LIST_WIDTH}; height: ${TAB_LIST_HEIGHT}"></ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
    tabRef.setProperty("model", simpleModel1);
    await page.waitForChanges();
    tabListRef = await page.find("ch-tab-render >>> div");
  });

  const testStretchToContainerSize = (
    tabListPosition: TabListPosition,
    showTabListStart: boolean,
    showTabListEnd: boolean
  ) => {
    const checkWidth =
      tabListPosition === "block-start" || tabListPosition === "block-end";
    const sizeDescription = checkWidth ? "width" : "height";
    const size = checkWidth ? TAB_LIST_WIDTH : TAB_LIST_HEIGHT;

    it(`[tabListPosition = "${tabListPosition}"][showTabListStart = ${showTabListStart}][showTabListEnd = ${showTabListEnd}] the tab-list should stretch to the container ${sizeDescription}`, async () => {
      tabRef.setProperty("tabListPosition", tabListPosition);
      tabRef.setProperty("showTabListStart", showTabListStart);
      tabRef.setProperty("showTabListEnd", showTabListEnd);
      await page.waitForChanges();

      const computedStyle = await tabListRef.getComputedStyle();

      expect(checkWidth ? computedStyle.width : computedStyle.height).toEqual(
        size
      );
    });
  };

  runTestsForFunction(testStretchToContainerSize);
});

describe.skip("[ch-tab-render][tab-list][with tab-list-start slot]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;
  let tabListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-tab-render style="width: ${TAB_LIST_WIDTH}; height: ${TAB_LIST_HEIGHT}">
        <div slot="tab-list-start" style="width: ${TAB_LIST_START_END_WIDTH}; height: ${TAB_LIST_START_END_HEIGHT}"></div>
      </ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
    tabRef.setProperty("model", simpleModel1);
    await page.waitForChanges();
    tabListRef = await page.find("ch-tab-render >>> div");
  });

  const testStretchToContainerSize = (
    tabListPosition: TabListPosition,
    showTabListStart: boolean,
    showTabListEnd: boolean
  ) => {
    const checkWidth =
      tabListPosition === "block-start" || tabListPosition === "block-end";
    const sizeDescription = checkWidth ? "width" : "height";
    const size = checkWidth
      ? getTabListWidth(showTabListStart, false)
      : getTabListHeight(showTabListStart, false);

    it(`[tabListPosition = "${tabListPosition}"][showTabListStart = ${showTabListStart}][showTabListEnd = ${showTabListEnd}] the tab-list ${sizeDescription} should be ${size}`, async () => {
      tabRef.setProperty("tabListPosition", tabListPosition);
      tabRef.setProperty("showTabListStart", showTabListStart);
      tabRef.setProperty("showTabListEnd", showTabListEnd);
      await page.waitForChanges();

      const computedStyle = await tabListRef.getComputedStyle();

      expect(checkWidth ? computedStyle.width : computedStyle.height).toEqual(
        size
      );
    });
  };

  runTestsForFunction(testStretchToContainerSize);
});

describe.skip("[ch-tab-render][tab-list][with tab-list-end slot]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;
  let tabListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-tab-render style="width: ${TAB_LIST_WIDTH}; height: ${TAB_LIST_HEIGHT}">
        <div slot="tab-list-end" style="width: ${TAB_LIST_START_END_WIDTH}; height: ${TAB_LIST_START_END_HEIGHT}"></div>
      </ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
    tabRef.setProperty("model", simpleModel1);
    await page.waitForChanges();
    tabListRef = await page.find("ch-tab-render >>> div");
  });

  const testStretchToContainerSize = (
    tabListPosition: TabListPosition,
    showTabListStart: boolean,
    showTabListEnd: boolean
  ) => {
    const checkWidth =
      tabListPosition === "block-start" || tabListPosition === "block-end";
    const sizeDescription = checkWidth ? "width" : "height";
    const size = checkWidth
      ? getTabListWidth(false, showTabListEnd)
      : getTabListHeight(false, showTabListEnd);

    it(`[tabListPosition = "${tabListPosition}"][showTabListStart = ${showTabListStart}][showTabListEnd = ${showTabListEnd}] the tab-list ${sizeDescription} should be ${size}`, async () => {
      tabRef.setProperty("tabListPosition", tabListPosition);
      tabRef.setProperty("showTabListStart", showTabListStart);
      tabRef.setProperty("showTabListEnd", showTabListEnd);
      await page.waitForChanges();

      const computedStyle = await tabListRef.getComputedStyle();

      expect(checkWidth ? computedStyle.width : computedStyle.height).toEqual(
        size
      );
    });
  };

  runTestsForFunction(testStretchToContainerSize);
});

describe("[ch-tab-render][tab-list][with tab-list-start and tab-list-end slots]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;
  let tabListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-tab-render style="width: ${TAB_LIST_WIDTH}; height: ${TAB_LIST_HEIGHT}">
        <div slot="tab-list-start" style="width: ${TAB_LIST_START_END_WIDTH}; height: ${TAB_LIST_START_END_HEIGHT}"></div>
        <div slot="tab-list-end" style="width: ${TAB_LIST_START_END_WIDTH}; height: ${TAB_LIST_START_END_HEIGHT}"></div>
      </ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
    tabRef.setProperty("model", simpleModel1);
    await page.waitForChanges();
    tabListRef = await page.find("ch-tab-render >>> div");
  });

  const testStretchToContainerSize = (
    tabListPosition: TabListPosition,
    showTabListStart: boolean,
    showTabListEnd: boolean
  ) => {
    const checkWidth =
      tabListPosition === "block-start" || tabListPosition === "block-end";
    const sizeDescription = checkWidth ? "width" : "height";
    const size = checkWidth
      ? getTabListWidth(showTabListStart, showTabListEnd)
      : getTabListHeight(showTabListStart, showTabListEnd);

    const testDescriptionPrefix = `[tabListPosition = "${tabListPosition}"][showTabListStart = ${showTabListStart}][showTabListEnd = ${showTabListEnd}]`;

    it(`${testDescriptionPrefix} the tab-list ${sizeDescription} should be ${size}`, async () => {
      tabRef.setProperty("tabListPosition", tabListPosition);
      tabRef.setProperty("showTabListStart", showTabListStart);
      tabRef.setProperty("showTabListEnd", showTabListEnd);
      await page.waitForChanges();

      const computedStyle = await tabListRef.getComputedStyle();

      expect(checkWidth ? computedStyle.width : computedStyle.height).toEqual(
        size
      );
    });
  };

  runTestsForFunction(testStretchToContainerSize);
});
