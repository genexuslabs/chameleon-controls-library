import { Component, Element, h, Prop } from "@stencil/core";
import { DropdownItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";

const DEFAULT_DROPDOWN_ITEM_CLASS = "dropdown-item";

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
      this.itemClickCallback(event, target, itemId);
    };

  private renderItem = (item: DropdownItemModel) => [
    <ch-dropdown-item
      slot="items"
      id={item.id}
      class={item.class || DEFAULT_DROPDOWN_ITEM_CLASS}
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
    >
      {item.caption}

      {item.items != null && item.items.map(this.renderItem)}
    </ch-dropdown-item>
  ];

  componentWillLoad() {
    this.showHeader = !!this.el.querySelector(':scope>[slot="header"]');
    this.showFooter = !!this.el.querySelector(':scope>[slot="footer"]');
  }

  render() {
    return (
      <ch-dropdown
        buttonLabel={this.buttonLabel}
        class={this.cssClass || null}
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
