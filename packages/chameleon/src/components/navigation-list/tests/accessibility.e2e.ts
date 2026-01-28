import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { unanimoShowcase } from "../../../showcase/assets/components/navigation-list/models";

describe("[ch-navigation-list-render][basic]", () => {
  let page: E2EPage;
  let navigationListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-navigation-list-render></ch-navigation-list-render>`,
      failOnConsoleError: true
    });

    navigationListRef = await page.find("ch-navigation-list-render");
  });

  it('should have role="list"', () =>
    expect(navigationListRef).toEqualAttribute("role", "list"));

  it('expandable items should have role="list"', async () => {
    navigationListRef.setProperty("model", unanimoShowcase);
    await page.waitForChanges();

    const firstExpandableItemRef = await page.find(
      "ch-navigation-list-render >>> ch-navigation-list-item >>> div[part*='item__group']"
    );

    expect(firstExpandableItemRef).toEqualAttribute("role", "list");
  });

  it('all items should have role="listitem"', async () => {
    navigationListRef.setProperty("model", unanimoShowcase);
    await page.waitForChanges();

    const navigationListItems = await page.findAll(
      "ch-navigation-list-render >>> ch-navigation-list-item"
    );

    navigationListItems.forEach(item =>
      expect(item).toEqualAttribute("role", "listitem")
    );
  });

  it('when the control is collapsed and showCaptionOnCollapse === "tooltip", all items should set the actionElementAccessibleName property in their ch-tooltip with the value of the caption property', async () => {
    navigationListRef.setProperty("model", unanimoShowcase);
    navigationListRef.setProperty("expanded", false);
    navigationListRef.setProperty("showCaptionOnCollapse", "tooltip");
    await page.waitForChanges();

    const navigationListItemCaptions = await Promise.all<string>(
      (
        await page.findAll(
          "ch-navigation-list-render >>> ch-navigation-list-item"
        )
      ).map(tooltipRef => tooltipRef.getProperty("caption"))
    );

    const tooltipActionElementAccessibleNames = await Promise.all<string>(
      (
        await page.findAll(
          "ch-navigation-list-render >>> ch-navigation-list-item >>> ch-tooltip"
        )
      ).map(tooltipRef => tooltipRef.getProperty("actionElementAccessibleName"))
    );

    tooltipActionElementAccessibleNames.forEach(
      (actionElementAccessibleName, index) => {
        expect(actionElementAccessibleName).toBe(
          navigationListItemCaptions[index]
        );
      }
    );
  });
});
