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

  /**
   * Allows to select only one item
   */
  @Prop() readonly singleSelection: boolean;

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

    if (this.toggleCheckboxes) {
      //This property should be set one time on the mainTree by the developer using the component. If present, apply to all the child trees.
      const childrenTrees = this.el.querySelectorAll("ch-tree");
      childrenTrees.forEach(function (tree) {
        (tree as unknown as ChTree).toggleCheckboxes = true;
      });
    }
    //If this tree has been added with appendChild, set toggleCheckboxes to true if the parent tree toggleCheckboxes property is set to true
    const closestTree = this.el.parentElement.parentElement;
    if (closestTree !== null && closestTree.tagName === "CH-TREE") {
      if ((closestTree as unknown as ChTree).toggleCheckboxes) {
        this.toggleCheckboxes = true;
      }
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

  @Listen("checkboxClickedEvent")
  checkboxClickedEventHandler() {
    if (this.toggleCheckboxes) {
      const childTreeItems = this.el.querySelectorAll("ch-tree-item");
      let allCheckboxesChecked = true;
      let allCheckboxesUnchecked = true;
      childTreeItems.forEach(function (treeItem) {
        if (treeItem.checked) {
          allCheckboxesUnchecked = false;
        } else {
          allCheckboxesChecked = false;
        }
      });
      const parentTreeItem = this.el.parentElement as unknown as ChTreeItem;
      const tagName = (parentTreeItem as unknown as HTMLElement).tagName;
      if (tagName === "CH-TREE-ITEM") {
        if (allCheckboxesChecked) {
          parentTreeItem.checked = true;
          parentTreeItem.indeterminate = false;
        } else if (allCheckboxesUnchecked) {
          parentTreeItem.checked = false;
          parentTreeItem.indeterminate = false;
        } else if (!allCheckboxesChecked && !allCheckboxesUnchecked) {
          parentTreeItem.checked = true;
          parentTreeItem.indeterminate = true;
        }
      }
    }
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
