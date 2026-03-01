import { h } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { ChFlexibleLayoutRender } from "../flexible-layout-render";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";
import { flexibleLayoutTestRenders, TEST1_ID, TEST3_ID } from "./renders-test";

const SLOT_AND_RENDER_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TEST1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST1_ID, name: "", slot: true }
    },
    {
      id: TEST3_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST3_ID, name: "", renderId: TEST3_ID }
    }
  ]
};

describe("[ch-flexible-layout-render][renders]", () => {
  let page: Awaited<ReturnType<typeof newSpecPage>>;
  let chFlexibleLayoutRender: HTMLChFlexibleLayoutRenderElement;
  let renderedWidgetsChangeSpy: jest.Mock;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [ChFlexibleLayoutRender],
      template: () => (
        <ch-flexible-layout-render renders={flexibleLayoutTestRenders} />
      )
    });

    chFlexibleLayoutRender = page.root as HTMLChFlexibleLayoutRenderElement;
    renderedWidgetsChangeSpy = jest.fn();
    chFlexibleLayoutRender.addEventListener(
      "renderedWidgetsChange",
      renderedWidgetsChangeSpy
    );
  });

  it("should render slots and traditional items with renders", async () => {
    chFlexibleLayoutRender.model = SLOT_AND_RENDER_MODEL;
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${TEST1_ID}"]`);
    expect(slot).not.toBeNull();
    expect(slot.getAttribute("slot")).toBe(TEST1_ID);

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST3_ID],
          slotted: [TEST1_ID]
        }
      })
    );
  });

  it("should not render a slot when widget.slot is false and slottedWidgets is true, but render via renders instead", async () => {
    chFlexibleLayoutRender.slottedWidgets = true;
    chFlexibleLayoutRender.model = {
      id: "root",
      direction: "columns",
      items: [
        {
          id: TEST3_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: TEST3_ID, name: "", slot: false }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${TEST3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST3_ID],
          slotted: []
        }
      })
    );
  });

  it("should not render a slot when widget.slot is false and slottedWidgets is false, but render via renders instead", async () => {
    chFlexibleLayoutRender.slottedWidgets = false;
    chFlexibleLayoutRender.model = {
      id: "root",
      direction: "columns",
      items: [
        {
          id: TEST3_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: TEST3_ID, name: "", slot: false }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${TEST3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST3_ID],
          slotted: []
        }
      })
    );
  });

  it("should not render a slot when widget.slot is undefined and slottedWidgets is false (default behavior), but render via renders instead", async () => {
    chFlexibleLayoutRender.slottedWidgets = false;
    chFlexibleLayoutRender.model = {
      id: "root",
      direction: "columns",
      items: [
        {
          id: TEST3_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: TEST3_ID, name: "" }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${TEST3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST3_ID],
          slotted: []
        }
      })
    );
  });

  /**
   * Note: For tests for slots, see `slots.e2e.ts`. This file includes
   * tests for the `renders` property (which expects functions). These
   * tests are implemented in this spec file instead of E2E tests
   * because Puppeteer cannot serialize JavaScript functions when
   * passing them between Node.js and the browser context. Spec tests
   * run in the same process, allowing us to pass functions directly.
   */
});
