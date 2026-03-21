import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

const FIRST_ITEM_ID = "item-1";
const SECOND_ITEM_ID = "item-2";

const actionListModelSimple: ActionListModel = [
  {
    id: FIRST_ITEM_ID,
    type: "actionable",
    caption: "Item 1"
  },
  {
    id: SECOND_ITEM_ID,
    type: "actionable",
    caption: "Item 2",
    selected: true
  }
];

const actionListModelNoSelection: ActionListModel = [
  { id: "a", type: "actionable", caption: "A" },
  { id: "b", type: "actionable", caption: "B" }
];

describe("[ch-action-list-render][selection]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it('should not emit selectedItemsChange when selection="none"', async () => {
    let eventFired = false;
    actionListRef.addEventListener("selectedItemsChange", () => {
      eventFired = true;
    });

    actionListRef.model = actionListModelNoSelection;
    await actionListRef.updateComplete;

    // Click on an item via the shadow DOM
    const item = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    item?.click();
    await actionListRef.updateComplete;

    // The selectedItemsChange should not have fired since selection is "none"
    expect(eventFired).toBe(false);
  });

  it('should select an item when selection="single" and the item is clicked', async () => {
    actionListRef.selection = "single";
    actionListRef.model = actionListModelSimple;
    await actionListRef.updateComplete;

    let emittedDetail: unknown;
    actionListRef.addEventListener("selectedItemsChange", ((
      e: CustomEvent
    ) => {
      emittedDetail = e.detail;
    }) as EventListener);

    // Click on the first item (which was not selected)
    const firstItem = actionListRef.shadowRoot!.querySelector(
      `ch-action-list-item[id="${FIRST_ITEM_ID}"]`
    );
    firstItem?.click();
    await actionListRef.updateComplete;

    expect(emittedDetail).toBeTruthy();
    expect(Array.isArray(emittedDetail)).toBe(true);
    const items = emittedDetail as Array<{ item: { id: string } }>;
    expect(items.length).toBe(1);
    expect(items[0].item.id).toBe(FIRST_ITEM_ID);
  });

  it('should replace selection when selection="single"', async () => {
    const model: ActionListModel = [
      { id: "a", type: "actionable", caption: "A", selected: true },
      { id: "b", type: "actionable", caption: "B" }
    ];

    actionListRef.selection = "single";
    actionListRef.model = model;
    await actionListRef.updateComplete;

    const emittedDetails: unknown[] = [];
    actionListRef.addEventListener("selectedItemsChange", ((
      e: CustomEvent
    ) => {
      emittedDetails.push(e.detail);
    }) as EventListener);

    // Click on item "b"
    const itemB = actionListRef.shadowRoot!.querySelector(
      'ch-action-list-item[id="b"]'
    );
    itemB?.click();
    await actionListRef.updateComplete;

    // Should have replaced selection
    expect(emittedDetails.length).toBeGreaterThanOrEqual(1);
    const lastDetail = emittedDetails[emittedDetails.length - 1] as Array<{
      item: { id: string };
    }>;
    expect(lastDetail.length).toBe(1);
    expect(lastDetail[0].item.id).toBe("b");
  });

  it("should work with updateItemProperties to change selection", async () => {
    actionListRef.selection = "single";
    actionListRef.model = actionListModelSimple;
    await actionListRef.updateComplete;

    let emittedDetail: unknown;
    actionListRef.addEventListener("selectedItemsChange", ((
      e: CustomEvent
    ) => {
      emittedDetail = e.detail;
    }) as EventListener);

    actionListRef.updateItemProperties(FIRST_ITEM_ID, {
      type: "actionable",
      selected: true
    });
    await actionListRef.updateComplete;

    expect(emittedDetail).toBeTruthy();
    const items = emittedDetail as Array<{ item: { id: string } }>;
    expect(items.length).toBe(1);
    expect(items[0].item.id).toBe(FIRST_ITEM_ID);
  });
});
