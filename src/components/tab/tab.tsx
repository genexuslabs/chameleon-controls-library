import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { FlexibleLayoutWidget } from "../flexible-layout/types";
import { tokenMap } from "../../common/utils";
import { TabSelectedItemInfo, TabType } from "./types";
import {
  BUTTON_CLASS,
  CAPTION_ID,
  CLOSE_BUTTON_PART,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_ID,
  PAGE_NAME_CLASS,
  SELECTED_PART,
  TAB_LIST_CLASS
} from "./utils";

@Component({
  shadow: true,
  styleUrl: "tab.scss",
  tag: "ch-tab"
})
export class ChTab {
  private classes: {
    BUTTON?: string;
    IMAGE?: string;
    PAGE?: string;
    PAGE_CONTAINER?: string;
    PAGE_NAME?: string;
    TAB_LIST?: string;
  } = {};
  private lastSelectedItem = -1;

  private showCaptions: boolean;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This label is used for the close button of the captions.
   */
  @Prop() readonly closeButtonAccessibleName: string = "Close";

  /**
   * `true` if the group has is view section expanded. Otherwise, only the
   * toolbar will be displayed.
   */
  @Prop() readonly expanded: boolean = true;

  /**
   * Specifies the items that are displayed in the group.
   */
  @Prop() readonly items: FlexibleLayoutWidget[];
  @Watch("items")
  handleItemsChange(newItems: FlexibleLayoutWidget[]) {
    this.updateSelectedIndex(newItems);
  }

  /**
   * `true` to display the name of the page.
   */
  @Prop() readonly showPageName: boolean = true;

  /**
   * Specifies the flexible layout type.
   */
  @Prop({ reflect: true }) readonly type: TabType;

  /**
   * Fired when an item of the main group is double clicked.
   */
  @Event() expandMainGroup: EventEmitter<string>;

  /**
   * Fired the close button of an item is clicked.
   */
  @Event() itemClose: EventEmitter<string>;

  /**
   * Fired when the selected item change.
   */
  @Event()
  selectedItemChange: EventEmitter<TabSelectedItemInfo>;

  private handleSelectedItemChange =
    (index: number, itemId: string) => (event: MouseEvent) => {
      event.stopPropagation();

      this.selectedItemChange.emit({
        lastSelectedIndex: this.lastSelectedItem,
        newSelectedId: itemId,
        newSelectedIndex: index,
        type: this.type
      });

      this.lastSelectedItem = index;
    };

  private updateSelectedIndex(items: FlexibleLayoutWidget[]) {
    if (items == null) {
      this.lastSelectedItem = -1;
      return;
    }

    this.lastSelectedItem = items.findIndex(item => item.selected);
  }

  private handleItemDblClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.expandMainGroup.emit();
  };

  private handleClose = (itemId: string) => (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.itemClose.emit(itemId);
  };

  private renderTabBar = () => (
    <div
      role="tablist"
      aria-label={this.accessibleName}
      class={this.classes.TAB_LIST}
      part={this.classes.TAB_LIST}
    >
      {this.items.map((item, index) => (
        <button
          key={CAPTION_ID(item.id)}
          id={CAPTION_ID(item.id)}
          role="tab"
          aria-controls={PAGE_ID(item.id)}
          aria-label={!this.showCaptions ? item.name : null}
          aria-selected={(!!item.selected).toString()}
          class={this.classes.BUTTON}
          part={tokenMap({
            [this.classes.BUTTON]: true,
            [CAPTION_ID(item.id)]: true,
            [SELECTED_PART]: item.selected
          })}
          onClick={
            !item.selected
              ? this.handleSelectedItemChange(index, item.id)
              : null
          }
          onDblClick={this.type === "main" ? this.handleItemDblClick : null}
        >
          {item.startImageSrc && (
            <img
              aria-hidden="true"
              class={{ [this.classes.IMAGE]: true, "caption-image": true }}
              part={this.classes.IMAGE}
              alt=""
              src={item.startImageSrc}
              loading="lazy"
            />
          )}

          {this.showCaptions && item.name}

          {this.showCaptions && (
            <button
              aria-label={this.closeButtonAccessibleName}
              class="close-button"
              part={CLOSE_BUTTON_PART}
              type="button"
              onClick={this.handleClose(item.id)}
            ></button>
          )}
        </button>
      ))}
    </div>
  );

  private renderTabPages = () => (
    <div
      class={{
        [this.classes.PAGE_CONTAINER]: true,
        "page-container": true,
        "page-container--collapsed": !this.expanded
      }}
      part={this.classes.PAGE_CONTAINER}
    >
      {this.items.map(item => (
        <div
          key={PAGE_ID(item.id)}
          id={PAGE_ID(item.id)}
          role="tabpanel"
          aria-labelledby={CAPTION_ID(item.name)}
          class={{
            [this.classes.PAGE]: true,
            "page--hidden": !item.selected
          }}
          part={this.classes.PAGE}
        >
          {this.showPageName &&
            (this.type === "inlineStart" || this.type === "inlineEnd") && (
              <span aria-hidden="true" part={this.classes.PAGE_NAME}>
                {item.name}
              </span>
            )}
          {item.wasRendered && <slot name={item.id} />}
        </div>
      ))}
    </div>
  );

  componentWillLoad() {
    this.updateSelectedIndex(this.items);

    // Initialize classes
    this.classes = {
      BUTTON: BUTTON_CLASS(this.type),
      IMAGE: IMAGE_CLASS(this.type),
      PAGE: PAGE_CLASS(this.type),
      PAGE_CONTAINER: PAGE_CONTAINER_CLASS(this.type),
      PAGE_NAME: PAGE_NAME_CLASS(this.type),
      TAB_LIST: TAB_LIST_CLASS(this.type)
    };

    this.showCaptions = this.type === "main" || this.type === "blockEnd";
  }

  render() {
    if (this.items == null || this.items.length === 0) {
      return "";
    }

    return (
      <Host>
        {this.renderTabBar()}
        {this.renderTabPages()}
      </Host>
    );
  }
}
