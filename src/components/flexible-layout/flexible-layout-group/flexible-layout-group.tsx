import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import {
  FlexibleLayoutGroup,
  FlexibleLayoutGroupSelectedItemInfo,
  FlexibleLayoutItem,
  FlexibleLayoutItemBase
} from "../types";
import {
  BUTTON_CLASS,
  CAPTION_ID,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_ID,
  PAGE_NAME_CLASS,
  TAB_LIST_CLASS
} from "../utils";
import { tokenMap } from "../../../common/utils";

const accessibleRoleMap: {
  [key in FlexibleLayoutGroup]:
    | "banner"
    | "complementary"
    | "contentinfo"
    | "main";
} = {
  "block-start": "banner",
  "inline-start": "complementary",
  main: "main",
  "inline-end": "complementary",
  "block-end": "contentinfo"
} as const;

@Component({
  shadow: true,
  styleUrl: "flexible-layout-group.scss",
  tag: "ch-flexible-layout-group"
})
export class ChFlexibleLayoutGroup {
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
  @Prop() readonly items: FlexibleLayoutItemBase[] | FlexibleLayoutItem[];
  @Watch("items")
  handleItemsChange(newItems: FlexibleLayoutItemBase[] | FlexibleLayoutItem[]) {
    if (this.type === "block-start") {
      return;
    }

    this.updateSelectedIndex(newItems);
  }

  /**
   * `true` to display the name of the page.
   */
  @Prop() readonly showPageName: boolean = true;

  /**
   * Specifies the flexible layout type.
   */
  @Prop({ reflect: true }) readonly type: FlexibleLayoutGroup;

  /**
   * Fired when the selected item change.
   */
  @Event()
  selectedItemChange: EventEmitter<FlexibleLayoutGroupSelectedItemInfo>;

  private handleSelectedItemChange =
    (index: number, itemId: string) => (event: MouseEvent) => {
      // Used to avoid an TypeScript error
      if (this.type === "block-start") {
        return;
      }

      event.stopPropagation();

      this.selectedItemChange.emit({
        group: this.type,
        lastSelectedIndex: this.lastSelectedItem,
        newSelectedId: itemId,
        newSelectedIndex: index
      });

      this.lastSelectedItem = index;
    };

  private updateSelectedIndex(
    items: FlexibleLayoutItemBase[] | FlexibleLayoutItem[]
  ) {
    if (this.type === "block-start") {
      return;
    }

    if (items == null) {
      this.lastSelectedItem = -1;
      return;
    }

    // Hack. Only block-start type has items: FlexibleLayoutItemBase[]
    this.lastSelectedItem = (items as FlexibleLayoutItem[]).findIndex(
      item => item.selected
    );
  }

  private renderItems = () => [
    <div
      role="tablist"
      aria-label={this.accessibleName}
      class={this.classes.TAB_LIST}
      part={this.classes.TAB_LIST}
    >
      {(this.items as FlexibleLayoutItem[]).map((item, index) => (
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
            selected: item.selected
          })}
          onClick={
            !item.selected
              ? this.handleSelectedItemChange(index, item.id)
              : null
          }
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
              part="close-button"
              type="button"
            ></button>
          )}
        </button>
      ))}
    </div>,

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
            "page--hidden": !item.displayed
          }}
          part={this.classes.PAGE}
        >
          {this.showPageName &&
            (this.type === "inline-start" || this.type === "inline-end") && (
              <span aria-hidden="true" part={this.classes.PAGE_NAME}>
                {item.name}
              </span>
            )}
          {item.wasRendered && <slot name={item.id} />}
        </div>
      ))}
    </div>
  ];

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

    this.showCaptions = this.type === "main" || this.type === "block-end";
  }

  render() {
    return (
      <Host role={accessibleRoleMap[this.type]}>
        {this.items?.length > 0 &&
          (this.type === "block-start" ? <slot /> : this.renderItems())}
      </Host>
    );
  }
}
