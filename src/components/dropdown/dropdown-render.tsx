import { Component, Element, forceUpdate, h, Prop } from "@stencil/core";
import { DropdownItemModel, DropdownModel } from "./types";
import { DropdownPosition } from "./internal/dropdown/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";
import { dropdownKeyEventsDictionary } from "./utils";
import { DROPDOWN_EXPORT_PARTS } from "../../common/reserved-names";

@Component({
  tag: "ch-dropdown-render",
  styleUrl: "dropdown-render.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChDropdownRender {
  #showHeader = false;
  #showFooter = false;

  #mainDropdownExpanded = false;

  @Element() el: HTMLChDropdownRenderElement;

  /**
   * This attribute lets you specify the label for the first expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

  /**
   * A CSS class to set as the `ch-dropdown` element class.
   */
  @Prop() readonly cssClass: string = "dropdown";

  /**
   * Specifies the parts that are exported by the internal dropdown. This
   * property is useful to override the exported parts.
   */
  @Prop() readonly exportParts: string = DROPDOWN_EXPORT_PARTS;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings: any;

  /**
   * This callback is executed when an item is clicked.
   */
  @Prop() readonly itemClickCallback: (
    event: UIEvent,
    target: string,
    itemId: string
  ) => void;

  /**
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly model: DropdownModel;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * A CSS class to set as the `ch-dropdown-item` element class.
   * This default class is used for the items that don't have an explicit class.
   */
  @Prop() readonly separatorCssClass: string = "dropdown-separator";

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  #handleItemClick = (target: string, itemId: string) => (event: UIEvent) => {
    if (this.itemClickCallback) {
      this.itemClickCallback(event, target, itemId);
    }
  };

  #renderItem = (level: number) => (item: DropdownItemModel) => {
    const hasItems = item.items?.length > 0;

    return [
      <ch-dropdown
        exportparts={this.exportParts}
        id={item.id}
        caption={item.caption}
        class={item.class || this.cssClass}
        endImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                item.endImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : item.endImgSrc
        }
        endImgType={item.endImgType ?? "background"}
        href={item.link?.url}
        itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
        leaf={!hasItems}
        level={level}
        position={item.itemsPosition || "OutsideEnd_InsideStart"}
        shortcut={item.shortcut}
        startImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                item.startImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : item.startImgSrc
        }
        startImgType={item.startImgType ?? "background"}
        onExpandedChange={
          !item.wasExpanded ? this.#handleItemExpanded(item) : null
        }
      >
        {hasItems &&
          item.wasExpanded &&
          item.items.map(this.#renderItem(level + 1))}

        {
          // Render a dummy element if the control was not expanded and has items
          hasItems && !item.wasExpanded && <ch-dropdown></ch-dropdown>
        }
      </ch-dropdown>,

      item.showSeparator && (
        <div
          aria-hidden="true"
          class={
            "ch-dropdown-separator " +
            (item.separatorClass || this.separatorCssClass)
          }
        ></div>
      )
    ];
  };

  #handleKeyDownEvents = (event: KeyboardEvent) => {
    const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
      dropdownKeyEventsDictionary[event.code];

    if (keyEventHandler) {
      event.stopPropagation();
      keyEventHandler(event);
    }
  };

  #handleItemExpanded = (item: DropdownItemModel) => () => {
    item.wasExpanded = true;
    forceUpdate(this);
  };

  #handleMainDropdownExpand = () => {
    this.#mainDropdownExpanded = true;
    forceUpdate(this);
  };

  componentWillLoad() {
    this.#showHeader = !!this.el.querySelector(':scope>[slot="header"]');
    this.#showFooter = !!this.el.querySelector(':scope>[slot="footer"]');
  }

  render() {
    return (
      <ch-dropdown
        exportparts={this.exportParts}
        buttonAccessibleName={this.buttonAccessibleName}
        class={this.cssClass}
        level={-1}
        showHeader={this.#showHeader}
        showFooter={this.#showFooter}
        position={this.position}
        onKeyDown={
          this.#mainDropdownExpanded ? this.#handleKeyDownEvents : null
        }
        onExpandedChange={
          !this.#mainDropdownExpanded ? this.#handleMainDropdownExpand : null
        }
      >
        <slot name="action" slot="action" />

        {this.#showHeader && <slot name="header" slot="header" />}

        {this.#showFooter && <slot name="footer" slot="footer" />}

        {this.#mainDropdownExpanded &&
          this.model != null &&
          this.model.map(this.#renderItem(0))}
      </ch-dropdown>
    );
  }
}
