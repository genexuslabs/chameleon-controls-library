import { E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  ChameleonControlsTagName,
  CssOverflowProperty
} from "../../common/types";
import { SCROLLABLE_CLASS } from "../../common/reserved-names";
import { CSS_SCROLLBAR_MODEL } from "../../components/theme/tests/utils.e2e";
import { JSX } from "../../components";

describe("[scrollbars styling]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage({ failOnConsoleError: true });
  });

  const testThemeDownload = (tag: ChameleonControlsTagName) =>
    it(`should style the ${tag}\'s scrollbars when setting a ch-theme with "chameleon/scrollbar"`, async () => {
      await page.setContent(`<ch-theme></ch-theme>
      <${tag}></${tag}>`);

      const themeRef = await page.find("ch-theme");
      const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

      themeRef.setProperty("model", CSS_SCROLLBAR_MODEL);

      await page.waitForChanges();
      await themeLoadedEvent;

      expect(themeLoadedEvent).toBeTruthy();

      const adoptedStyleSheets = await page.evaluate(
        tag =>
          document
            .querySelector(tag)
            .shadowRoot.adoptedStyleSheets.map(
              sheet => sheet.cssRules[0].cssText
            ),
        tag
      );

      // It has an adoptedStyleSheet
      expect(adoptedStyleSheets.length).toBeGreaterThan(0);

      // It contains the style of the scrollbar.css
      expect(
        adoptedStyleSheets.some(item => item.includes(":host(.ch-scrollable)"))
      ).toBeTruthy();
    });

  const testScrollbarClass = <T extends ChameleonControlsTagName>(
    tag: T,
    scrollbarSelector?: string,
    additionalProperties?: {
      [key in keyof JSX.IntrinsicElements[T]]: JSX.IntrinsicElements[T][key];
    }
  ) =>
    it(`the ${tag} component should have the "${SCROLLABLE_CLASS}" class to properly style its scrollbars${
      additionalProperties
        ? " when " + JSON.stringify(additionalProperties)
        : ""
    }`, async () => {
      await page.setContent(`<${tag}></${tag}>`);
      const componentRef = await page.find(tag);

      if (additionalProperties) {
        Object.keys(additionalProperties).forEach(propertyName => {
          componentRef.setProperty(
            propertyName,
            additionalProperties[propertyName]
          );
        });
        await page.waitForChanges();
      }

      const componentScrollbarRef = await page.find(scrollbarSelector ?? tag);
      expect(componentScrollbarRef.className).toContain(SCROLLABLE_CLASS);
    });

  testThemeDownload("ch-action-list-render");
  testThemeDownload("ch-code");
  testThemeDownload("ch-edit");
  testThemeDownload("ch-navigation-list-render");
  testThemeDownload("ch-popover");
  testThemeDownload("ch-smart-grid");
  testThemeDownload("ch-tab-render");

  testScrollbarClass("ch-action-list-render");
  testScrollbarClass("ch-code");
  testScrollbarClass("ch-edit", "ch-edit >>> textarea", { multiline: true });
  testScrollbarClass("ch-navigation-list-render");
  testScrollbarClass("ch-popover", "ch-popover", {
    overflowBehavior: "add-scroll"
  });
  testScrollbarClass("ch-smart-grid", "ch-smart-grid", {
    autoGrow: false,
    loadingState: "initial",
    itemsCount: 0
  });

  const tabTestCases = [
    "auto",
    "auto auto",
    "auto clip",
    "auto hidden",
    "auto scroll",
    "auto visible",
    "clip auto",
    "hidden auto",
    "scroll auto",
    "visible auto",
    "scroll",
    "scroll scroll",
    "scroll clip",
    "scroll hidden",
    "scroll visible",
    "clip scroll",
    "hidden scroll",
    "visible scroll"
  ] satisfies (
    | CssOverflowProperty
    | `${CssOverflowProperty} ${CssOverflowProperty}`
  )[];

  // TODO: Add unit tests for which panels should not have the SCROLLABLE_CLASS
  tabTestCases.forEach(overflowTestCase =>
    testScrollbarClass(
      "ch-tab-render",
      "ch-tab-render >>> [style*='auto'], ch-tab-render >>> [style*='scroll']",
      {
        model: [{ id: "Item 1", overflow: overflowTestCase }],
        selectedId: "Item 1"
      }
    )
  );

  tabTestCases.forEach(overflowTestCase =>
    testScrollbarClass(
      "ch-tab-render",
      "ch-tab-render >>> [style*='auto'], ch-tab-render >>> [style*='scroll']",
      {
        model: [{ id: "Item 1" }],
        overflow: overflowTestCase,
        selectedId: "Item 1"
      }
    )
  );
});
