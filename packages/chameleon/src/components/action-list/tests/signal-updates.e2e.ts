import { html } from "lit";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-lit";

import type { ChActionListRender } from "../action-list-render.lit";
import type { ActionListModel } from "../types";

// Side-effect import to register the component
import "../action-list-render.lit";

describe("[ch-action-list-render][signal-updates]", () => {
  let actionListRef: ChActionListRender;

  beforeEach(async () => {
    render(
      html`<ch-action-list-render></ch-action-list-render>`
    );
    actionListRef = document.querySelector("ch-action-list-render")!;
    await actionListRef.updateComplete;
  });

  it("should update when model property changes", async () => {
    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(0);

    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" },
      { id: "b", type: "actionable", caption: "B" }
    ];
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(2);
  });

  it("should update when model is replaced with a different model", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" }
    ];
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(1);

    actionListRef.model = [
      { id: "x", type: "actionable", caption: "X" },
      { id: "y", type: "actionable", caption: "Y" },
      { id: "z", type: "actionable", caption: "Z" }
    ];
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(3);
  });

  it("should update when selection property changes", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A", selected: true },
      { id: "b", type: "actionable", caption: "B" }
    ];
    actionListRef.selection = "single";
    await actionListRef.updateComplete;

    // Change selection to multiple
    actionListRef.selection = "multiple";
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBe("true");

    // Change selection to none
    actionListRef.selection = "none";
    await actionListRef.updateComplete;

    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();
  });

  it("addItem should add an item at the root level", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" }
    ];
    await actionListRef.updateComplete;

    actionListRef.addItem({ id: "b", type: "actionable", caption: "B" });
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(2);
  });

  it("addItem should add an item to a group", async () => {
    const model: ActionListModel = [
      {
        id: "group-1",
        type: "group",
        caption: "Group",
        expandable: true,
        expanded: true,
        items: [{ id: "item-a", type: "actionable", caption: "A" }]
      }
    ];
    actionListRef.model = model;
    await actionListRef.updateComplete;

    actionListRef.addItem(
      { id: "item-b", type: "actionable", caption: "B" },
      "group-1"
    );
    await actionListRef.updateComplete;

    // The group should now have 2 items
    expect(model[0].type === "group" && model[0].items.length).toBe(2);
  });

  it("addItem should not add duplicate items", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" }
    ];
    await actionListRef.updateComplete;

    actionListRef.addItem({ id: "a", type: "actionable", caption: "A duplicate" });
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(1);
  });

  it("removeItem should remove an item", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" },
      { id: "b", type: "actionable", caption: "B" }
    ];
    await actionListRef.updateComplete;

    actionListRef.removeItem("a");
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(1);
  });

  it("removeItem should remove a group and all its descendants", async () => {
    const model: ActionListModel = [
      {
        id: "group-1",
        type: "group",
        caption: "Group",
        expandable: true,
        expanded: true,
        items: [
          { id: "item-a", type: "actionable", caption: "A" },
          { id: "item-b", type: "actionable", caption: "B" }
        ]
      }
    ];
    actionListRef.model = model;
    await actionListRef.updateComplete;

    actionListRef.removeItem("group-1");
    await actionListRef.updateComplete;

    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-group").length
    ).toBe(0);
    expect(
      actionListRef.shadowRoot!.querySelectorAll("ch-action-list-item").length
    ).toBe(0);
  });

  it("getItemsInfo should return correct info", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" },
      { id: "b", type: "actionable", caption: "B" }
    ];
    await actionListRef.updateComplete;

    const info = actionListRef.getItemsInfo(["a", "b"]);
    expect(info.length).toBe(2);
    expect(info[0].item.id).toBe("a");
    expect(info[1].item.id).toBe("b");
  });

  it("getItemsInfo should skip non-existent items", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "A" }
    ];
    await actionListRef.updateComplete;

    const info = actionListRef.getItemsInfo(["a", "nonexistent"]);
    expect(info.length).toBe(1);
    expect(info[0].item.id).toBe("a");
  });

  it("updateItemProperties should update caption", async () => {
    actionListRef.model = [
      { id: "a", type: "actionable", caption: "Old Caption" }
    ];
    await actionListRef.updateComplete;

    actionListRef.updateItemProperties("a", {
      type: "actionable",
      caption: "New Caption"
    });
    await actionListRef.updateComplete;

    const info = actionListRef.getItemsInfo(["a"]);
    expect((info[0].item as { caption: string }).caption).toBe("New Caption");
  });
});
