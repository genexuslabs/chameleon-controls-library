import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const BUTTON_1_SELECTOR = "[id='button-1']";
const BUTTON_2_SELECTOR = "[id='button-2']";
const BUTTON_INSIDE_SELECTOR = "ch-tooltip >>> button";

const ACCESSIBLE_NAME_1 = "Hello world";
const ACCESSIBLE_NAME_2 = "Another string";

const ARIA_LABEL_ATTR = "aria-label";
const ARIA_DESCRIBED_BY_ATTR = "aria-describedby";

const performTest = (
  actionElementBindingType: "inside-action" | "reference" | "standalone"
) => {
  let description = "";
  let tooltipHTML = "";

  if (actionElementBindingType === "inside-action") {
    description =
      "ch-tooltip with actionElement === null (inside the actionElement)";
    tooltipHTML = `
      <button id="button-2" type="button">
        Action 2
        <ch-tooltip></ch-tooltip>
      </button>`;
  } else if (actionElementBindingType === "reference") {
    description = "ch-tooltip with the actionElement ref";
    tooltipHTML = `
      <button id="button-2" type="button">
        Action 2
      </button>
      <ch-tooltip></ch-tooltip>`;
  } else {
    description = "ch-tooltip with actionElement === undefined";
    tooltipHTML = `<ch-tooltip></ch-tooltip>`;
  }

  describe(`[ch-tooltip][accessibility][${description}]`, () => {
    let page: E2EPage;
    let anotherButtonRef: E2EElement;
    let tooltipRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<button id="button-1" type="button">Action 1</button>
              ${tooltipHTML}`,
        failOnConsoleError: true
      });
      anotherButtonRef = await page.find(BUTTON_1_SELECTOR);
      tooltipRef = await page.find("ch-tooltip");
      tooltipRef.setProperty("delay", 0); // Avoid any race condition by removing the delay

      // Set the actionElement binding
      if (actionElementBindingType === "reference") {
        await page.evaluate((actionElementSelector: string) => {
          const actionElementRef = document.querySelector(
            actionElementSelector
          ) as HTMLButtonElement;

          document.querySelector("ch-tooltip").actionElement = actionElementRef;
        }, BUTTON_2_SELECTOR);
      } else if (actionElementBindingType === "inside-action") {
        tooltipRef.setProperty("actionElement", null);
      }

      await page.waitForChanges();

      // We have to refresh the ch-tooltip reference again, since we changed
      // its properties
      tooltipRef = await page.find("ch-tooltip");
    });

    const displayPopover = async () => {
      await anotherButtonRef.focus();
      await anotherButtonRef.press("Tab");
      await page.waitForChanges();
    };

    const getPopoverRef = () => page.find("ch-tooltip >>> ch-popover");
    const getActionElementRef = () =>
      page.find(
        actionElementBindingType === "standalone"
          ? BUTTON_INSIDE_SELECTOR
          : BUTTON_2_SELECTOR
      );

    if (actionElementBindingType === "standalone") {
      it("should not have an aria-hidden when the popover is not visible", () =>
        expect(tooltipRef).not.toHaveAttribute("aria-hidden"));

      it('should not have role="tooltip"', () =>
        expect(tooltipRef).not.toHaveAttribute("role"));

      it("should not have an id", () =>
        expect(tooltipRef).not.toHaveAttribute("id"));

      it('the internal popover should have role="tooltip"', async () => {
        await displayPopover();
        expect(await getPopoverRef()).toEqualAttribute("role", "tooltip");
      });

      it("the internal popover should have an id", async () => {
        await displayPopover();
        expect(await getPopoverRef()).toHaveAttribute("id");
      });
    } else {
      it("should have an aria-hidden when the popover is not visible", () =>
        expect(tooltipRef).toEqualAttribute("aria-hidden", "true"));

      it('should have role="tooltip"', () =>
        expect(tooltipRef).toEqualAttribute("role", "tooltip"));

      it("should have an id", () => expect(tooltipRef).toHaveAttribute("id"));

      it('the internal popover should not have role="tooltip"', async () => {
        await displayPopover();
        expect(await getPopoverRef()).not.toEqualAttribute("role", "tooltip");
      });

      it("the internal popover should not have an id", async () => {
        await displayPopover();
        expect(await getPopoverRef()).not.toHaveAttribute("id");
      });
    }

    it("should not render an aria-hidden when the popover is visible", async () => {
      await displayPopover();
      tooltipRef = await page.find("ch-tooltip");

      tooltipRef = await page.find("ch-tooltip");
      expect(tooltipRef).not.toHaveAttribute("aria-hidden");
    });

    const addOrRemove =
      actionElementBindingType === "standalone" ? "not add" : "add";

    it(`should ${addOrRemove} the aria-hidden when the popover is dismissed`, async () => {
      await displayPopover();

      // Hide popover
      await anotherButtonRef.focus();
      await page.waitForChanges();

      tooltipRef = await page.find("ch-tooltip");

      if (actionElementBindingType === "standalone") {
        expect(tooltipRef).not.toHaveAttribute("aria-hidden");
      } else {
        expect(tooltipRef).toHaveAttribute("aria-hidden");
      }
    });

    it("the actionElement should not have an aria-label set by default, since by default actionElementAccessibleName === undefined", async () =>
      expect(await getActionElementRef()).not.toHaveAttribute(ARIA_LABEL_ATTR));

    it("the actionElement should have an aria-label set if actionElementAccessibleName is defined", async () => {
      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_1);
      await page.waitForChanges();

      expect(await getActionElementRef()).toEqualAttribute(
        ARIA_LABEL_ATTR,
        ACCESSIBLE_NAME_1
      );
    });

    it("the actionElementAccessibleName property should be reactive", async () => {
      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_1);
      await page.waitForChanges();

      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_2);
      await page.waitForChanges();

      expect(await getActionElementRef()).toEqualAttribute(
        ARIA_LABEL_ATTR,
        ACCESSIBLE_NAME_2
      );
    });

    it("if the actionElementAccessibleName property is removed in runtime, the aria-label should be removed from the actionElement", async () => {
      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_1);
      await page.waitForChanges();

      tooltipRef.setProperty("actionElementAccessibleName", undefined);
      await page.waitForChanges();

      expect(await getActionElementRef()).not.toHaveAttribute(ARIA_LABEL_ATTR);
    });

    it('the actionElement should have an aria-describedby set that matches the ID of the element with role="tooltip"', async () => {
      let tooltipId = "";

      if (actionElementBindingType === "standalone") {
        await displayPopover();
        tooltipId = (await getPopoverRef()).getAttribute("id");
      } else {
        tooltipId = tooltipRef.getAttribute("id");
      }

      expect(await getActionElementRef()).toEqualAttribute(
        ARIA_DESCRIBED_BY_ATTR,
        tooltipId
      );
    });

    it("should remove the aria-label and aria-describedby from the old actionElement when updating the actionElement property in runtime", async () => {
      // Add aria-label, otherwise the check will always be valid
      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_1);
      await page.waitForChanges();

      await page.evaluate((actionElementSelector: string) => {
        const actionElementRef = document.querySelector(
          actionElementSelector
        ) as HTMLButtonElement;

        document.querySelector("ch-tooltip").actionElement = actionElementRef;
      }, BUTTON_1_SELECTOR);
      await page.waitForChanges();
      const actionRef = await getActionElementRef();

      if (actionElementBindingType === "standalone") {
        // When the "standalone" mode has an actual reference, the inner button
        // should be destroyed
        expect(actionRef).toBeFalsy();
      } else {
        expect(actionRef).not.toHaveAttribute(ARIA_LABEL_ATTR);
        expect(actionRef).not.toHaveAttribute(ARIA_DESCRIBED_BY_ATTR);
      }
    });

    it("should add the aria-label and aria-describedby in the new actionElement when updating the actionElement property in runtime", async () => {
      tooltipRef.setProperty("actionElementAccessibleName", ACCESSIBLE_NAME_1);

      await page.evaluate((actionElementSelector: string) => {
        const actionElementRef = document.querySelector(
          actionElementSelector
        ) as HTMLButtonElement;

        document.querySelector("ch-tooltip").actionElement = actionElementRef;
      }, BUTTON_1_SELECTOR);
      await page.waitForChanges();

      // Refresh the references
      anotherButtonRef = await page.find(BUTTON_1_SELECTOR);
      tooltipRef = await page.find("ch-tooltip");

      const tooltipId = tooltipRef.getAttribute("id");

      expect(anotherButtonRef).toEqualAttribute(
        ARIA_LABEL_ATTR,
        ACCESSIBLE_NAME_1
      );
      expect(anotherButtonRef).toEqualAttribute(
        ARIA_DESCRIBED_BY_ATTR,
        tooltipId
      );
    });

    if (actionElementBindingType !== "standalone") {
      it("should remove the aria-label and aria-describedby from the actionElement when the ch-tooltip is destroyed", async () => {
        // Add aria-label, otherwise the check will always be valid
        tooltipRef.setProperty(
          "actionElementAccessibleName",
          ACCESSIBLE_NAME_1
        );
        await page.waitForChanges();

        await page.evaluate(() =>
          document.querySelector("ch-tooltip").remove()
        );
        await page.waitForChanges();

        const actionRef = await getActionElementRef();
        expect(actionRef).not.toHaveAttribute(ARIA_LABEL_ATTR);
        expect(actionRef).not.toHaveAttribute(ARIA_DESCRIBED_BY_ATTR);
      });
    }
  });
};

performTest("reference");
performTest("inside-action");
performTest("standalone");
