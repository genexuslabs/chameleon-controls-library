import { Component, Element, forceUpdate, h, Prop } from "@stencil/core";
import { DropdownItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";

@Component({
  tag: "ch-dropdown-render",
  styleUrl: "dropdown-render.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChDropdownRender {
  private showHeader = false;
  private showFooter = false;

  @Element() el: HTMLChDropdownRenderElement;

  /**
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonLabel: string = "Show options";

  /**
   * A CSS class to set as the `ch-dropdown` element class.
   */
  @Prop() readonly cssClass: string = "dropdown";

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   */
  @Prop() readonly expandBehavior: "Click" | "ClickOrHover" = "ClickOrHover";

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
   * A CSS class to set as the `ch-dropdown-item` element class.
   * This default class is used for the items that don't have an explicit class.
   */
  @Prop() readonly itemCssClass: string = "dropdown-item";

  /**
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly model: DropdownItemModel[];

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  private handleItemClick =
    (target: string, itemId: string) => (event: UIEvent) => {
      if (this.itemClickCallback) {
        this.itemClickCallback(event, target, itemId);
      }
    };

  private renderItem = (item: DropdownItemModel) => [
    <ch-dropdown-item
      slot="items"
      id={item.id}
      caption={item.caption}
      class={item.class || this.itemCssClass}
      expandBehavior={this.expandBehavior}
      href={item.link?.url}
      leftImgSrc={
        this.useGxRender
          ? fromGxImageToURL(
              item.startImage,
              this.gxSettings,
              this.gxImageConstructor
            )
          : item.startImage
      }
      openOnFocus={this.openOnFocus}
      position={item.itemsPosition || "OutsideEnd_InsideStart"}
      rightImgSrc={
        this.useGxRender
          ? fromGxImageToURL(
              item.endImage,
              this.gxSettings,
              this.gxImageConstructor
            )
          : item.endImage
      }
      shortcut={item.shortcut}
      onClick={this.handleItemClick(item.link?.url, item.id)}
      onExpandedChange={
        !item.wasExpanded ? this.#handleItemExpanded(item) : null
      }
    >
      {item.items?.length > 0 &&
        item.wasExpanded &&
        item.items.map(this.renderItem)}

      {
        // Render a dummy element if the control was not expanded and has items
        item.items?.length > 0 && !item.wasExpanded && (
          <ch-dropdown-item></ch-dropdown-item>
        )
      }
    </ch-dropdown-item>
  ];

  #handleItemExpanded = (item: DropdownItemModel) => () => {
    item.wasExpanded = true;
    forceUpdate(this);
  };

  componentWillLoad() {
    this.showHeader = !!this.el.querySelector(':scope>[slot="header"]');
    this.showFooter = !!this.el.querySelector(':scope>[slot="footer"]');
  }

  render() {
    return (
      <ch-dropdown
        buttonLabel={this.buttonLabel}
        class={this.cssClass}
        expandBehavior={this.expandBehavior}
        openOnFocus={this.openOnFocus}
        position={this.position}
      >
        <slot name="action" slot="action" />

        {this.showHeader && <slot name="header" slot="header" />}

        {this.model != null && this.model.map(this.renderItem)}

        {this.showFooter && <slot name="footer" slot="footer" />}
      </ch-dropdown>
    );
  }
}
