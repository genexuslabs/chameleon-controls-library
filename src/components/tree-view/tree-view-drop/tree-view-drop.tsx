import { Component, Host, Prop, h } from "@stencil/core";
import {
  INITIAL_LEVEL,
  getTreeItemLevelPart
} from "../../renders/tree-view/utils";
import { DragState } from "../tree-view-item/tree-view-item";

const TREE_DROP_TAG_NAME = "ch-tree-view-drop";

@Component({
  tag: "ch-tree-view-drop",
  styleUrl: "tree-view-drop.scss",
  shadow: true
})
export class ChTreeViewDrop {
  /**
   * This property lets you define the current state of the item when it's
   * being dragged.
   */
  @Prop() readonly dragState: DragState = "none";

  /**
   * Level in the tree at which the item is placed.
   */
  @Prop() readonly level: number = INITIAL_LEVEL;

  /**
   * Specifies the type of drop that is performed over the control.
   */
  @Prop() readonly type: "before" | "after" = "before";

  render() {
    const canShowLines = this.level !== INITIAL_LEVEL;
    const levelPart = getTreeItemLevelPart(this.level % 2 === 0);

    return (
      <Host
        class={{
          ["gx-" + levelPart]: canShowLines,
          [TREE_DROP_TAG_NAME + "--drag-enter"]: this.dragState === "enter"
        }}
        style={{ "--level": `${this.level}` }}
      ></Host>
    );
  }
}
