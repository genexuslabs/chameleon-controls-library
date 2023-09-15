import {
  Component,
  Host,
  h,
  Element,
  Prop,
  State,
  Event,
  EventEmitter
} from "@stencil/core";

@Component({
  tag: "ch-action-group",
  styleUrl: "action-group.scss",
  shadow: true
})
export class ChActionGroup {
  @Element() el: HTMLChActionGroupElement;

  /**
   * The items inside the actions menu button.
   */
  @State() actionsButtonItems: HTMLChActionGroupItemElement[] = [];

  /**
   * This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed
   * to make the control responsive to changes in the Width of the container of ActionGroup.
   *
   * | Value                 | Details                                                                                          |
   * | --------------------- | ------------------------------------------------------------------------------------------------ |
   * | `Add Scroll`          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |
   * | `Multiline`           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |
   * | `Responsive Collapse` | The Action Group items, when they start to overflow the control, are placed in the More Actions. |
   */
  @Prop() readonly itemsOverflowBehavior:
    | "AddScroll"
    | "Multiline"
    | "ResponsiveCollapse" = "ResponsiveCollapse";

  /**
   * This attribute determines the position of the More Actions button in the Action Group.
   *
   * | Value   | Details                                                               |
   * | --------| --------------------------------------------------------------------- |
   * | `Start` | The More Actions Button is displayed to the left of the ActionGroup.  |
   * | `End`   | The More Actions Button is displayed to the right of the ActionGroup. |
   */
  @Prop() readonly moreActionsButtonPosition: "Start" | "End" = "Start";

  /**
   * The index of item action that is targeted.
   */
  @Prop({ mutable: true }) openIndex: number = null;

  /**
   *  When it's true and an action is hovered show the actions menu.
   */
  @Prop() readonly showActionsMenuOnHover: boolean = true;

  /**
   * Fired when the item is targeted or not.
   */
  @Event() displayedItemsCountChange: EventEmitter<number>;

  render() {
    return <Host role="menubar"></Host>;
  }
}
