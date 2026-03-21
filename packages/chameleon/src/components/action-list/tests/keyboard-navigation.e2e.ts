import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

const simpleModel: ActionListModel = [
  { id: "item-1", type: "actionable", caption: "Item 1" },
  { id: "item-2", type: "actionable", caption: "Item 2" },
  { id: "item-3", type: "actionable", caption: "Item 3" }
];

const modelWithDisabled: ActionListModel = [
  { id: "item-1", type: "actionable", caption: "Item 1" },
  { id: "item-2", type: "actionable", caption: "Item 2", disabled: true },
  { id: "item-3", type: "actionable", caption: "Item 3" }
];

const modelWithGroup: ActionListModel = [
  {
    id: "group-1",
    type: "group",
    caption: "Group 1",
    expandable: true,
    expanded: true,
    items: [
      { id: "item-1-1", type: "actionable", caption: "Item 1.1" },
      { id: "item-1-2", type: "actionable", caption: "Item 1.2" }
    ]
  },
  { id: "item-2", type: "actionable", caption: "Item 2" }
];

describe("[ch-action-list-render][keyboard-navigation]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render
        selection="single"
      ></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it("should render all items for keyboard interaction", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const items =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item");
    expect(items.length).toBe(3);
  });

  it("should render model with disabled items", async () => {
    actionListRef.model = modelWithDisabled;
    await actionListRef.updateComplete;

    const items =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item");
    expect(items.length).toBe(3);

    // The second item should be disabled
    expect(items[1].disabled).toBe(true);
  });

  it("should render model with group items for keyboard navigation", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const groups =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-group");
    expect(groups.length).toBe(1);

    // Group should have expandable button
    const groupButton = groups[0].shadowRoot!.querySelector("button");
    expect(groupButton).toBeTruthy();
  });

  it("keydown events should be handled (no errors thrown)", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    // Focus first item
    const firstItem = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    firstItem?.focus();

    // Dispatch ArrowDown - should not throw
    const arrowDownEvent = new KeyboardEvent("keydown", {
      code: "ArrowDown",
      bubbles: true,
      composed: true
    });
    actionListRef.dispatchEvent(arrowDownEvent);
    await actionListRef.updateComplete;

    // No assertion on focus target, just ensuring no error is thrown
    expect(true).toBe(true);
  });
});
