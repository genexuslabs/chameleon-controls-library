import { Component, Element, Host, Prop, Watch, h } from "@stencil/core";
import { TreeXLines } from "../tree-x/types";

/**
 * This variable specifies a reference to the main ch-tree-x element
 */
let mainTreeRef: HTMLChTreeXElement;

@Component({
  tag: "ch-tree-x-list",
  styleUrl: "tree-x-list.scss",
  shadow: true
})
export class ChTreeListX {
  private slotRef: HTMLSlotElement;

  @Element() el: HTMLChTreeXListElement;

  /**
   * Level in the tree at which the control is placed.
   */
  @Prop({ mutable: true }) level = 0;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop({ mutable: true }) showLines: TreeXLines = "none";

  @Watch("showLines")
  handleShowLinesChange(newValue: TreeXLines) {
    // Displayed items may have changed since the last time that `showLines === true`
    if (newValue !== "none" && this.level !== 0) {
      this.updateLastItemDashedLine();
    }
  }

  private updateLastItemDashedLine = () => {
    // @todo WA to avoid StencilJS' bug. The showLines Watch is dispatched
    // before the componentDidLoad lifecycle method completes
    if (!this.slotRef) {
      return;
    }

    const treeItems =
      this.slotRef.assignedElements() as HTMLChTreeXListItemElement[];

    if (treeItems.length === 0) {
      return;
    }

    const lastItemIndex = treeItems.length - 1;

    for (let i = 0; i < lastItemIndex; i++) {
      treeItems[i].lastItem = false;
    }
    treeItems[lastItemIndex].lastItem = true;
  };

  componentWillLoad() {
    // Set tree level
    const parentElement = this.el.parentElement as
      | HTMLChTreeXElement
      | HTMLChTreeXListItemElement;

    // Set item level
    this.level = parentElement.level + 1;

    // If the mainTreeRef is not defined, the first item that will load this
    // reference will be the top tree-x-list
    if (!mainTreeRef) {
      mainTreeRef = parentElement as HTMLChTreeXElement;
    }

    this.showLines = mainTreeRef.showLines;
  }

  render() {
    return (
      <Host role={this.level === 0 ? "tree" : "group"}>
        <slot
          onSlotchange={
            this.showLines !== "none" && this.level !== 0
              ? this.updateLastItemDashedLine
              : null
          }
          ref={el => (this.slotRef = el as HTMLSlotElement)}
        />
      </Host>
    );
  }
}
