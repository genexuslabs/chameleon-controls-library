import { h } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { ChFlexibleLayoutRender } from "../flexible-layout-render";
import { ChFlexibleLayout } from "../internal/flexible-layout/flexible-layout";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";
import {
  flexibleLayoutTestRenders,
  TEST1_ID,
  TEST3_ID,
  TEST4_ID
} from "./renders-test";

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
      // Note: Include `ChFlexibleLayout` so `ch-flexible-layout` is hydrated in
      // spec tests. Otherwise `updateSelectedWidget()` would call `forceUpdate`
      // on a non-hydrated element and crash.
      components: [ChFlexibleLayoutRender, ChFlexibleLayout],
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

  // tabbed widgets - render via renders
  // Note: We only test with multiple widgets to verify tabbed-specific behavior.
  // The slot/render decision logic is already tested with single-content items.

  it("should render selected tabbed widget via renders when widget.slot is false", async () => {
    chFlexibleLayoutRender.slottedWidgets = false;
    chFlexibleLayoutRender.model = {
      id: "root",
      direction: "columns",
      items: [
        {
          id: "tabbed-item",
          size: "1fr",
          type: "tabbed",
          selectedWidgetId: TEST4_ID,
          widgets: [
            { id: TEST3_ID, name: "Tab 1", slot: false, renderId: TEST3_ID },
            { id: TEST4_ID, name: "Tab 2", slot: false, renderId: TEST4_ID }
          ]
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Only the selected widget (TEST4_ID) should be rendered
    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${TEST4_ID}"]`);
    expect(slot).toBeNull();

    const span = chFlexibleLayoutEl.querySelector(
      `span[slot="${TEST4_ID}"]`
    ) as HTMLSpanElement;
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("Something within the span");

    // TEST3_ID should not be rendered (not selected)
    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    );
    expect(button).toBeNull();

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST4_ID],
          slotted: []
        }
      })
    );
  });

  it("should render newly selected tabbed widget content when updating selected widget", async () => {
    chFlexibleLayoutRender.slottedWidgets = false;
    chFlexibleLayoutRender.model = {
      id: "root",
      direction: "columns",
      items: [
        {
          id: "tabbed-item",
          size: "1fr",
          type: "tabbed",
          selectedWidgetId: TEST4_ID,
          widgets: [
            { id: TEST3_ID, name: "Tab 1", slot: false, renderId: TEST3_ID },
            { id: TEST4_ID, name: "Tab 2", slot: false, renderId: TEST4_ID }
          ]
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Initially, only TEST4_ID should be rendered
    const initialSpan = chFlexibleLayoutEl.querySelector(
      `span[slot="${TEST4_ID}"]`
    ) as HTMLSpanElement;
    expect(initialSpan).not.toBeNull();
    expect(initialSpan.textContent).toBe("Something within the span");

    const initialButton = chFlexibleLayoutEl.querySelector(
      `button[slot="${TEST3_ID}"]`
    );
    expect(initialButton).toBeNull();

    // Verify initial event was emitted with TEST4_ID
    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [TEST4_ID],
          slotted: []
        }
      })
    );

    // Use the updateSelectedWidget method to change the selected tab
    await chFlexibleLayoutRender.updateSelectedWidget("tabbed-item", TEST3_ID);
    await page.waitForChanges();

    // Re-query the element after the change, as the DOM may have been updated
    const chFlexibleLayoutElAfterChange =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Now TEST3_ID should be rendered and visible
    const button = chFlexibleLayoutElAfterChange.querySelector(
      `button[slot="${TEST3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    // Verify both events were emitted: initial with TEST4_ID, then with both widgets
    expect(renderedWidgetsChangeSpy).toHaveBeenCalledTimes(2);
    expect(renderedWidgetsChangeSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        detail: {
          rendered: [TEST4_ID],
          slotted: []
        }
      })
    );
    // After changing to TEST3_ID, both widgets remain in renderedWidgets
    // This is because updateSelectedWidget adds the new widget but doesn't remove the previous one
    expect(renderedWidgetsChangeSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        detail: {
          rendered: [TEST4_ID, TEST3_ID],
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
