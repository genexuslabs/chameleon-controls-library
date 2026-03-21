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
    items: [{ id: "item-1-1", type: "actionable", caption: "Item 1.1" }]
  }
];

describe("[ch-action-list-render][accessibility]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it('should have role="list"', () => {
    expect(actionListRef.getAttribute("role")).toBe("list");
  });

  it("should not have aria-multiselectable by default", () => {
    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();
  });

  it('should not have aria-multiselectable when selection="single"', async () => {
    actionListRef.selection = "single";
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();
  });

  it('should have aria-multiselectable="true" when selection="multiple"', async () => {
    actionListRef.selection = "multiple";
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBe("true");
  });

  it("should remove aria-multiselectable when switching from multiple to none", async () => {
    actionListRef.selection = "multiple";
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBe("true");

    actionListRef.selection = "none";
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();
  });

  it('separators should have role="separator" and aria-hidden="true"', async () => {
    actionListRef.model = modelWithSeparator;
    await actionListRef.updateComplete;

    const separator = actionListRef.shadowRoot!.querySelector(
      '[role="separator"]'
    );
    expect(separator).toBeTruthy();
    expect(separator!.getAttribute("aria-hidden")).toBe("true");
  });

  it('items should have role="listitem"', async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const items =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item");

    items.forEach(item => {
      expect(item.getAttribute("role")).toBe("listitem");
    });
  });

  it('groups should have role="listitem"', async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const groups =
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-group");

    groups.forEach(group => {
      expect(group.getAttribute("role")).toBe("listitem");
    });
  });
});
