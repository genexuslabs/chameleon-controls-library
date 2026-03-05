/**
 * Validates widget rendering via the `renders` property (JSX callbacks).
 * Uses spec tests because Puppeteer cannot serialize JavaScript functions.
 *
 * For slot-based projection tests see `slots.e2e.ts`. For end-to-end slot
 * attribute validation across all three shadow DOM levels, see
 * `slot-attributes.e2e.ts`.
 */
import { h } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { ChFlexibleLayoutRender } from "../../flexible-layout-render";
import { ChFlexibleLayout } from "../../internal/flexible-layout/flexible-layout";
import { FlexibleLayoutModel } from "../../internal/flexible-layout/types";
import {
  flexibleLayoutTestRenders,
  LEAF1_ID,
  WIDGET1_ID,
  WIDGET3_ID,
  WIDGET4_ID
} from "./renders-test";

const LEAF2_ID = "Leaf2";

const SLOT_AND_RENDER_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET1_ID, name: "", slot: true }
    },
    {
      id: LEAF2_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET3_ID, name: "", renderId: WIDGET3_ID }
    }
  ]
};

/**
 * Model where widget.id equals leaf.id.
 * (For backward compatibility tests)
 */
const ONE_WIDGET_SAME_ID_AS_LEAF_RENDER: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: LEAF1_ID, name: "", renderId: LEAF1_ID }
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

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${WIDGET1_ID}"]`);
    expect(slot).not.toBeNull();
    expect(slot.getAttribute("slot")).toBe(WIDGET1_ID);

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET3_ID],
          slotted: [WIDGET1_ID]
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
          id: LEAF1_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: WIDGET3_ID, name: "", slot: false }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${WIDGET3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET3_ID],
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
          id: LEAF1_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: WIDGET3_ID, name: "", slot: false }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${WIDGET3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET3_ID],
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
          id: LEAF1_ID,
          size: "1fr",
          type: "single-content",
          widget: { id: WIDGET3_ID, name: "" }
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${WIDGET3_ID}"]`);
    expect(slot).toBeNull();

    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET3_ID],
          slotted: []
        }
      })
    );
  });

  /**
   * Backward compatibility test: validates that renders work correctly when
   * widget.id equals leaf.id. This ensures existing users who were using the
   * same ID for both the leaf and its widget continue to work after the fix
   * that changed slot names in `ch-flexible-layout` from `name={leaf.id}` to
   * `name={leaf.widget.id}`.
   */
  it("should render via renders when widget.id equals leaf.id (backward compatibility)", async () => {
    chFlexibleLayoutRender.slottedWidgets = false;
    chFlexibleLayoutRender.model = ONE_WIDGET_SAME_ID_AS_LEAF_RENDER;
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    const div = chFlexibleLayoutEl.querySelector(
      `div[slot="${LEAF1_ID}"]`
    ) as HTMLDivElement;
    expect(div).not.toBeNull();
    expect(div.textContent).toBe("Leaf1 content");

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [LEAF1_ID],
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
          selectedWidgetId: WIDGET4_ID,
          widgets: [
            {
              id: WIDGET3_ID,
              name: "Tab 1",
              slot: false,
              renderId: WIDGET3_ID
            },
            {
              id: WIDGET4_ID,
              name: "Tab 2",
              slot: false,
              renderId: WIDGET4_ID
            }
          ]
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Only the selected widget (WIDGET4_ID) should be rendered
    const slot = chFlexibleLayoutEl.querySelector(`slot[name="${WIDGET4_ID}"]`);
    expect(slot).toBeNull();

    const span = chFlexibleLayoutEl.querySelector(
      `span[slot="${WIDGET4_ID}"]`
    ) as HTMLSpanElement;
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("Something within the span");

    // WIDGET3_ID should not be rendered (not selected)
    const button = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    );
    expect(button).toBeNull();

    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET4_ID],
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
          selectedWidgetId: WIDGET4_ID,
          widgets: [
            {
              id: WIDGET3_ID,
              name: "Tab 1",
              slot: false,
              renderId: WIDGET3_ID
            },
            {
              id: WIDGET4_ID,
              name: "Tab 2",
              slot: false,
              renderId: WIDGET4_ID
            }
          ]
        }
      ]
    };
    await page.waitForChanges();

    const chFlexibleLayoutEl =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Initially, only WIDGET4_ID should be rendered
    const initialSpan = chFlexibleLayoutEl.querySelector(
      `span[slot="${WIDGET4_ID}"]`
    ) as HTMLSpanElement;
    expect(initialSpan).not.toBeNull();
    expect(initialSpan.textContent).toBe("Something within the span");

    const initialButton = chFlexibleLayoutEl.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    );
    expect(initialButton).toBeNull();

    // Verify initial event was emitted with WIDGET4_ID
    expect(renderedWidgetsChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          rendered: [WIDGET4_ID],
          slotted: []
        }
      })
    );

    // Use the updateSelectedWidget method to change the selected tab
    await chFlexibleLayoutRender.updateSelectedWidget(
      "tabbed-item",
      WIDGET3_ID
    );
    await page.waitForChanges();

    // Re-query the element after the change, as the DOM may have been updated
    const chFlexibleLayoutElAfterChange =
      chFlexibleLayoutRender.shadowRoot.querySelector("ch-flexible-layout");

    // Now WIDGET3_ID should be rendered and visible
    const button = chFlexibleLayoutElAfterChange.querySelector(
      `button[slot="${WIDGET3_ID}"]`
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Something");

    // Verify both events were emitted: initial with WIDGET4_ID, then with both widgets
    expect(renderedWidgetsChangeSpy).toHaveBeenCalledTimes(2);
    expect(renderedWidgetsChangeSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        detail: {
          rendered: [WIDGET4_ID],
          slotted: []
        }
      })
    );
    // After changing to WIDGET3_ID, both widgets remain in renderedWidgets
    // This is because updateSelectedWidget adds the new widget but doesn't remove the previous one
    expect(renderedWidgetsChangeSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        detail: {
          rendered: [WIDGET4_ID, WIDGET3_ID],
          slotted: []
        }
      })
    );
  });
});
