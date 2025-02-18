import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const BUTTON_1_SELECTOR = "[id='button-1']";
const BUTTON_2_SELECTOR = "[id='button-2']";
// const BUTTON_INSIDE_SELECTOR = "ch-tooltip >>> button";

const performTest = (
  actionElementBindingType: "inside-action" | "reference" | "standalone"
) => {
  let description = "";
  let tooltipHTML = "";

  if (actionElementBindingType === "inside-action") {
    description = "ch-tooltip inside the actionElement";
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
    // let actionElementRef: E2EElement;
    let tooltipRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<button id="button-1" type="button">Action 1</button>
              ${tooltipHTML}`,
        failOnConsoleError: true
      });
      anotherButtonRef = await page.find(BUTTON_1_SELECTOR);
      // actionElementRef = await page.find(
      //   actionElementBindingType === "standalone"
      //     ? BUTTON_INSIDE_SELECTOR
      //     : BUTTON_2_SELECTOR
      // );
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

    if (actionElementBindingType === "standalone") {
      it("should not render an aria-hidden when the popover is not visible", async () => {
        expect(tooltipRef).not.toHaveAttribute("aria-hidden");
      });
    } else {
      it("should render an aria-hidden when the popover is not visible", async () => {
        expect(tooltipRef).toEqualAttribute("aria-hidden", "true");
      });
    }

    it("should not render an aria-hidden when the popover is visible", async () => {
      await anotherButtonRef.focus();
      await anotherButtonRef.press("Tab");
      await page.waitForChanges();
      tooltipRef = await page.find("ch-tooltip");

      tooltipRef = await page.find("ch-tooltip");
      expect(tooltipRef).not.toHaveAttribute("aria-hidden");
    });

    const addOrRemove =
      actionElementBindingType === "standalone" ? "not add" : "add";

    it(`should ${addOrRemove} the aria-hidden when the popover is dismissed`, async () => {
      await anotherButtonRef.focus();
      await anotherButtonRef.press("Tab");
      await page.waitForChanges();
      // To this point is visible

      await anotherButtonRef.focus();
      await page.waitForChanges();
      // Now is hidden

      tooltipRef = await page.find("ch-tooltip");

      if (actionElementBindingType === "standalone") {
        expect(tooltipRef).not.toHaveAttribute("aria-hidden");
      } else {
        expect(tooltipRef).toHaveAttribute("aria-hidden");
      }
    });
  });
};

performTest("reference");
performTest("inside-action");
performTest("standalone");
