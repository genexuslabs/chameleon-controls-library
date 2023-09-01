import { Component, h, Prop, Listen, Host, Watch } from "@stencil/core";
import {
  SelectedTreeItemInfo,
  TreeXItemModel,
  TreeXModel
} from "../tree-x/types";

@Component({
  tag: "ch-test-tree-x",
  styleUrl: "test-tree-x.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChTestTreeX {
  private tree!: HTMLChTreeXElement;

  /**
   * Useful to ignore the tree model change when it was committed from lazy
   * loading items.
   */
  private ignoreTreeModelChange = false;

  // UI Model
  private flattenedTreeModel: Map<string, TreeXItemModel> = new Map();
  private flattenedLazyTreeModel: Map<string, TreeXItemModel> = new Map();

  /**
   * This property lets you define the model of the ch-tree-x control.
   */
  @Prop({ mutable: true }) treeModel: TreeXModel = { items: [] };
  @Watch("treeModel")
  handleTreeModelChange() {
    if (this.ignoreTreeModelChange) {
      this.ignoreTreeModelChange = false;
      return;
    }

    this.flattenModel();
    console.log("handleTreeModelChange - - - - - - - - - -");
  }

  /**
   * Callback that is executed when a item request to load its subitems.
   */
  @Prop() readonly lazyLoadTreeItemsCallback: (
    treeItemId: string
  ) => Promise<TreeXItemModel[]>;

  /**
   * Set this attribute if you want to allow multi selection of the items.
   */
  @Prop({ mutable: true }) multiSelection = false;

  @Listen("loadLazyContent")
  loadLazyChildrenHandler(event: CustomEvent<string>) {
    event.stopPropagation();
    const treeItemId = event.detail;

    if (this.lazyLoadTreeItemsCallback) {
      const promise = this.lazyLoadTreeItemsCallback(treeItemId);

      promise.then(result => {
        const itemToLazyLoadContent =
          this.flattenedLazyTreeModel.get(treeItemId);
        this.flattenedLazyTreeModel.delete(treeItemId);

        itemToLazyLoadContent.items = result;

        this.flattenSubModel(result);
        console.log("NEW Flattened lazy model:", this.flattenedLazyTreeModel);

        this.ignoreTreeModelChange = true;

        // Force re-render by making a shallow copy of the model
        this.treeModel = { ...this.treeModel };
      });
    }
  }

  private closeTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"], false);
  };

  private openTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"], true);
  };

  private toggleTreeNodeHandler = () => {
    // this.tree.toggleItems(["number-1-1-2"]);
  };

  private handleSelectedItemsChange = (
    event: CustomEvent<SelectedTreeItemInfo[]>
  ) => {
    console.log(event.detail);
  };

  private getCheckedItemsHandler = async () => {
    // const checked = await this.tree.getCheckedItems();
    // console.log(checked);
  };

  // private deleteNodeHandler = () => {
  //   this.treeItemsModel = [];
  // };

  private renderSubModel = (treeSubModel: TreeXItemModel) => (
    <ch-tree-x-list-item
      id={treeSubModel.id}
      caption={treeSubModel.caption}
      checkbox={treeSubModel.checkbox}
      checked={treeSubModel.checked}
      class={treeSubModel.cssClass}
      disabled={treeSubModel.disabled}
      expanded={treeSubModel.expanded}
      lazyLoad={treeSubModel.lazy}
      leaf={treeSubModel.leaf}
      leftImgSrc={treeSubModel.leftImgSrc}
      rightImgSrc={treeSubModel.rightImgSrc}
      selected={treeSubModel.selected}
      showExpandableButton={treeSubModel.showExpandableButton}
      toggleCheckboxes={treeSubModel.toggleCheckboxes}
    >
      {!!treeSubModel.items && (
        <ch-tree-x-list slot="tree">
          {treeSubModel.items.map(this.renderSubModel)}
        </ch-tree-x-list>
      )}
    </ch-tree-x-list-item>
  );

  private flattenSubModel(subModel: TreeXItemModel[]) {
    if (!subModel) {
      return;
    }

    subModel.forEach(item => {
      this.flattenedTreeModel.set(item.id, item);

      if (item.lazy) {
        this.flattenedLazyTreeModel.set(item.id, item);
      }

      this.flattenSubModel(item.items);
    });
  }

  private flattenModel() {
    this.flattenSubModel(this.treeModel.items);

    console.log("Flattened model:", this.flattenedTreeModel);
    console.log("Flattened lazy model:", this.flattenedLazyTreeModel);
  }

  private handleMultiSelectionChange = (event: CustomEvent) => {
    const checked = (event.target as HTMLInputElement).checked;
    console.log("handleMultiSelectionChange", checked);

    this.multiSelection = checked;
  };

  componentWillLoad() {
    this.flattenModel();
  }

  render() {
    return (
      <Host>
        <ch-tree-x
          multiSelection={this.multiSelection}
          onSelectedItemsChange={this.handleSelectedItemsChange}
        >
          <ch-tree-x-list>
            {this.treeModel.items.map(this.renderSubModel)}
          </ch-tree-x-list>
        </ch-tree-x>

        <div class="tree-buttons">
          <button type="button" onClick={this.closeTreeNodeHandler}>
            Close 1-1-2
          </button>

          <button type="button" onClick={this.openTreeNodeHandler}>
            Open 1-1-2
          </button>

          <button type="button" onClick={this.toggleTreeNodeHandler}>
            Toggle 1-1-2
          </button>

          <button type="button" onClick={this.getCheckedItemsHandler}>
            Get Checked Items
          </button>

          <ch-checkbox caption="Check / uncheck all"></ch-checkbox>

          <ch-checkbox
            checkedValue="true"
            unCheckedValue="false"
            value={this.multiSelection.toString()}
            caption="Multi selection"
            onInput={this.handleMultiSelectionChange}
          ></ch-checkbox>

          {/* <button type="button" onClick={this.deleteNodeHandler}>
          Delete Tree
        </button> */}
        </div>
      </Host>
    );
  }
}
