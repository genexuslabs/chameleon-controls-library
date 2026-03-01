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

/**
 * These tests run as spec (not E2E) because Puppeteer seemingly cannot
 * serialize functions like StencilJS's `h`, which is required by the
 * `renders` prop. Spec tests run in the same process, so we can pass
 * functions directly.
 */

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
});
