import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

const simpleModel: ActionListModel = [
  { id: "item-1", type: "actionable", caption: "Item 1" },
  { id: "item-2", type: "actionable", caption: "Item 2", selected: true }
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

const modelWithDisabled: ActionListModel = [
  {
    id: "item-1",
    type: "actionable",
    caption: "Item 1",
    disabled: true
  }
];

describe("[ch-action-list-render][parts]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it("separator should have part='separator'", async () => {
    actionListRef.model = modelWithSeparator;
    await actionListRef.updateComplete;

    const separator = actionListRef.shadowRoot!.querySelector(
      '[part="separator"]'
    );
    expect(separator).toBeTruthy();
  });

  it("items should have part='item'", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const items = actionListRef.shadowRoot!.querySelectorAll(
      'ch-action-list-item[part="item"]'
    );
    expect(items.length).toBe(2);
  });

  it("groups should have part='group'", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const groups = actionListRef.shadowRoot!.querySelectorAll(
      'ch-action-list-group[part="group"]'
    );
    expect(groups.length).toBe(1);
  });

  it("item action button should have item__action part", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const item = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    const button = item?.shadowRoot!.querySelector(
      'button[part*="item__action"]'
    );
    expect(button).toBeTruthy();
  });

  it("item caption should have item__caption part", async () => {
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const item = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    const caption = item?.shadowRoot!.querySelector(
      '[part="item__caption"]'
    );
    expect(caption).toBeTruthy();
  });

  it("disabled items should include disabled part", async () => {
    actionListRef.model = modelWithDisabled;
    await actionListRef.updateComplete;

    const item = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-item"
    );
    const button = item?.shadowRoot!.querySelector(
      'button[part*="disabled"]'
    );
    expect(button).toBeTruthy();
  });

  it("selected items should include selected part when selectable", async () => {
    actionListRef.selection = "single";
    actionListRef.model = simpleModel;
    await actionListRef.updateComplete;

    const selectedItem = actionListRef.shadowRoot!.querySelector(
      'ch-action-list-item[id="item-2"]'
    );
    const button = selectedItem?.shadowRoot!.querySelector(
      'button[part*="selected"]'
    );
    expect(button).toBeTruthy();
  });

  it("group expandable container should have group__expandable part", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const group = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-group"
    );
    const expandable = group?.shadowRoot!.querySelector(
      '[part*="group__expandable"]'
    );
    expect(expandable).toBeTruthy();
  });

  it("group action button should have group__action part", async () => {
    actionListRef.model = modelWithGroup;
    await actionListRef.updateComplete;

    const group = actionListRef.shadowRoot!.querySelector(
      "ch-action-list-group"
    );
    const action = group?.shadowRoot!.querySelector(
      '[part*="group__action"]'
    );
    expect(action).toBeTruthy();
  });
});
