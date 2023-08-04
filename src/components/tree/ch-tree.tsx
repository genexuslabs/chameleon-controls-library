import { Component, Element, State, h, Prop, Listen } from "@stencil/core";
import { ChTreeItem } from "../tree-item/ch-tree-item";

@Component({
  tag: "ch-tree",
  styleUrl: "ch-tree.scss",
  shadow: true
})
export class ChTree {
  @Element() el: HTMLChTreeElement;
  ulTree!: HTMLElement;

  //PROPS
  /**
   * Set this attribute if you want all this tree tree-items to have a checkbox
   */
  @Prop() readonly checkbox: boolean = false;

  /**
   * Set this attribute if you want all this tree tree-items to have the checkbox checked
   */
  @Prop() readonly checked: boolean = false;

  /**
   * Set this attribute if you want all the childen item's checkboxes to be checked when the parent item checkbox is checked, or to be unchecked when the parent item checkbox is unckecked.
   */
  @Prop({ mutable: true }) toggleCheckboxes = false;

  //STATE
  @State() nestedTree = false;
  @State() mainTree = false;

  componentWillLoad() {
    //Check if this tree is nested
    const parentElementTagName = this.el.parentElement.tagName;
    if (parentElementTagName === "CH-TREE-ITEM") {
      this.nestedTree = true;
    }
    //if this is the main tree...
    const parentTreeTagName = this.el.parentElement.tagName;
    if (parentTreeTagName !== "CH-TREE-ITEM") {
      this.mainTree = true;
    }
  }

  @Listen("liItemClicked")
  liItemClickedHandler() {
    //Remove 'selected' state from previous selected item
    const chTreeItems = this.el.querySelectorAll("ch-tree-item");
    chTreeItems.forEach(chTreeItem => {
      (chTreeItem as unknown as ChTreeItem).selected = false;
    });
  }

  @Listen("toggleIconClicked")
  toggleIconClickedHandler() {
    //Update not leaf tree items vertical line height
    const treeItems = this.el.querySelectorAll("ch-tree-item.not-leaf");
    treeItems.forEach(treeItem => {
      (treeItem as unknown as ChTreeItem).updateTreeVerticalLineHeight();
    });
  }

  render() {
    return this.mainTree ? (
      <div
        class={{
          tree: true,
          "main-tree": true
        }}
      >
        <div class="main-tree-container">
          <ul ref={el => (this.ulTree = el as HTMLElement)}>
            <slot></slot>
          </ul>
        </div>
      </div>
    ) : (
      <div
        class={{
          tree: true,
          "nested-tree": true
        }}
      >
        <ul ref={el => (this.ulTree = el as HTMLElement)}>
          <slot></slot>
        </ul>
      </div>
    );
  }
}
