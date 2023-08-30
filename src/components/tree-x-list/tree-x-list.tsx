import { Component, Element, Host, Prop, Watch, h } from "@stencil/core";

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
  @Prop({ mutable: true }) showLines = true;

  @Watch("showLines")
  handleShowLinesChange(newValue: boolean) {
    // Displayed items may have changed since the last time that `showLines === true`
    if (newValue) {
      this.updateLastItemDashedLine();
    }
  }

  private updateLastItemDashedLine = () => {
    const treeItems =
      this.slotRef.assignedElements() as HTMLChTreeXListItemElement[];

    if (treeItems.length === 0) {
      return;
    }

    treeItems.forEach(treeItem => {
      treeItem.lastItem = false;
    });

    treeItems[treeItems.length - 1].lastItem = true;
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
            this.showLines && this.level !== 0
              ? this.updateLastItemDashedLine
              : null
          }
          ref={el => (this.slotRef = el as HTMLSlotElement)}
        />
      </Host>
    );
  }
}
