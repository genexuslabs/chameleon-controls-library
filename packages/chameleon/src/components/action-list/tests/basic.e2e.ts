import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

const simpleModel: ActionListModel = [
  {
    id: "item-1",
    type: "actionable",
    caption: "Item 1"
  },
  {
    id: "item-2",
    type: "actionable",
    caption: "Item 2"
  }
];

const modelWithSeparator: ActionListModel = [
  { id: "item-1", type: "actionable", caption: "Item 1" },
  { id: "sep-1", type: "separator" },
  { id: "item-2", type: "actionable", caption: "Item 2" }
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
  {
    id: "item-2",
    type: "actionable",
    caption: "Item 2"
  }
];

describe("[ch-action-list-render][basic]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it("should have a shadowRoot", () => {
    expect(actionListRef.shadowRoot).toBeTruthy();
  });

  it("should render empty if the model is not set", () => {
    const content = actionListRef.shadowRoot!.innerHTML;
    // When model is empty array (default), no items should be rendered
    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(0);
  });

  it("should render items when model is set", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const items =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item");
    expect(items.length).toBe(2);
  });

  it("should render separators", async () => {
    actionListRef.model = modelWithSeparator;
    await actionListRef.updateComplete;

    const separators = actionListRef.shadowRoot!.querySelectorAll(
      '[role="separator"]'
    );
    expect(separators.length).toBe(1);
  });

  it("should render groups with children", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const groups =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-group");
    expect(groups.length).toBe(1);

    // The root should also have the standalone item
    const rootItems =
      actionListRef.shadowRoot!.querySelectorAll(":scope > ch-action-list-item");
    expect(rootItems.length).toBe(1);
  });

  it("should have display: grid by default", () => {
    expect(
      getComputedStyle(actionListRef).getPropertyValue("display")
    ).toBe("grid");
  });

  it("should default checkbox to false", () => {
    expect(actionListRef.checkbox).toBe(false);
  });

  it("should default checked to false", () => {
    expect(actionListRef.checked).toBe(false);
  });

  it("should default disabled to false", () => {
    expect(actionListRef.disabled).toBe(false);
  });

  it("should default editableItems to true", () => {
    expect(actionListRef.editableItems).toBe(true);
  });

  it('should default selection to "none"', () => {
    expect(actionListRef.selection).toBe("none");
  });
});
