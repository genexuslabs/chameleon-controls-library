import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

const simpleModel: ActionListModel = [
  { id: "item-1", type: "actionable", caption: "Item 1" },
  { id: "item-2", type: "actionable", caption: "Item 2" }
];

const modelWithGroup: ActionListModel = [
  {
    id: "group-1",
    type: "group",
    caption: "Group 1",
    expandable: true,
    expanded: true,
    items: [{ id: "item-1-1", type: "actionable", caption: "Item 1.1" }]
  }
];

describe("[ch-action-list-render][events]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it('should emit itemClick when selection="none" and an item is clicked', async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    let emittedDetail: unknown;
    actionListRef.addEventListener("itemClick", ((e: CustomEvent) => {
      emittedDetail = e.detail;
    }) as EventListener);

    const item = actionListRef.shadowRoot!.querySelector(
      'ch-action-list-item[id="item-1"]'
    );
    item?.click();
    await actionListRef.updateComplete;

    expect(emittedDetail).toBeTruthy();
    expect((emittedDetail as { item: { id: string } }).item.id).toBe("item-1");
  });

  it('should not emit itemClick when selection="single"', async () => {
    actionListRef.selection = "single";
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    let eventFired = false;
    actionListRef.addEventListener("itemClick", () => {
      eventFired = true;
    });

    const item = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    item?.click();
    await actionListRef.updateComplete;

    expect(eventFired).toBe(false);
  });

  it("should emit itemClick for expandable group header clicks", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    let emittedDetail: unknown;
    actionListRef.addEventListener("itemClick", ((e: CustomEvent) => {
      emittedDetail = e.detail;
    }) as EventListener);

    const group = actionListRef.shadowRoot!.querySelector(
      'ch-action-list-group[id="group-1"]'
    );
    group?.click();
    await actionListRef.updateComplete;

    expect(emittedDetail).toBeTruthy();
    expect((emittedDetail as { item: { id: string } }).item.id).toBe(
      "group-1"
    );
  });
});
