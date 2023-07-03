import {
  Component,
  Host,
  h,
  Element,
  Prop,
  Event,
  EventEmitter
} from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
const ENTER_KEY_CODE = "Enter";
const SPACE_KEY_CODE = "Space";

/**
 * @part link - The <a> element inside the action item.
 *
 * @slot - The slot where you can put the text or element for the <a> inside the action item.
 */
@Component({
  tag: "ch-action-group-item",
  styleUrl: "action-group-item.scss",
  shadow: true
})
export class ChActionGroupItem implements ChComponent {
  private a: HTMLElement = null;

  private menu: HTMLChDropdownElement;

  @Element() el: HTMLChActionGroupItemElement;

  /**
   * A CSS class to set as the `ch-action-group-item` element class when it is un the first level (disposedTop = true).
   */
  @Prop() readonly cssClass: string;

  /**
   * This attribute lets you specify if the action item is activated or not.
   */
  @Prop({ mutable: true }) deactivated = true;

  /* @Watch("deactivated")
  watchPropDeactivatedHandler(newValue: boolean) {
    if (this.menu) {
      this.menu.closed = newValue;
    }

    this.actionGroupItemTargeted.emit({
      active: !newValue,
      item: this.el as HTMLChActionGroupItemElement
    });
  } */

  /**
   * This attribute lets you specify if the action item is disabled or not.
   */
  @Prop({ mutable: true }) disabled = false;

  /**
   * Visual position of the menu of item. When action item is in the first level disposedTop = true.
   */
  @Prop() readonly disposedTop: boolean = false;

  /* @Watch("disposedTop")
  watchPropDisposedTopHandler(newValue: boolean) {
    if (this.menu) {
      this.menu.disposedTop = newValue;
    }
  } */

  /**
   * This attribute lets you specify if the action item is presented or not.
   */
  @Prop() readonly presented = true;

  /**
   * A CSS class to set as the `ch-action-group-item` element class when it is inside a ch-action-group-menu.
   */
  @Prop() readonly groupedClass: string;

  /**
   * The url for item navigate.
   */
  @Prop() readonly link: string;

  /**
   *  When it's true and an the action is hovered show the menu.
   */
  @Prop() readonly showActionsMenuOnHover: boolean = true;

  /**
   * Fired when the item is targeted or not.
   */
  @Event({
    eventName: "actionGroupItemTargeted"
  })
  actionGroupItemTargeted: EventEmitter<ActionGroupItemTargetEvent>;

  /**
   * Fired when the item is selected.
   */
  @Event({
    eventName: "actionGroupItemSelected"
  })
  actionGroupItemSelected: EventEmitter<HTMLChActionGroupItemElement>;

  /**
   * Fired when a KeyboardEvent is captured for the action item.
   */
  @Event({
    eventName: "actionGroupItemKeyDown"
  })
  actionGroupItemKeyDown: EventEmitter<ActionGroupItemKeyDownEvent>;

  componentDidLoad() {
    const menus: any = this.el.querySelectorAll("ch-dropdown");
    if (menus.length > 0) {
      this.menu = menus[0];
    }
    this.el.addEventListener("mousedown", this.handleMousedown);
    this.el.addEventListener("touchstart", this.handleTouchStart);
    /* this.el.addEventListener("mouseover", this.handleMouseover); */
    this.el.addEventListener("keydown", this.handleActionKeyDown);
  }

  private handleMousedown = (ev: MouseEvent) => {
    ev.stopPropagation();
    /* if (!this.disabled && this.menu) {
      const actionExpanded = this.a.getAttribute("aria-expanded") === "true";
      this.deactivated = actionExpanded;
    } */
    if (!this.link && !this.menu) {
      this.actionGroupItemSelected.emit(
        this.el as HTMLChActionGroupItemElement
      );
    }
  };

  private handleTouchStart = (ev: TouchEvent) => {
    ev.preventDefault();
  };

  private handleActionKeyDown = (event: KeyboardEvent) => {
    if (
      (event.code === SPACE_KEY_CODE || event.code === ENTER_KEY_CODE) &&
      !this.link &&
      !this.menu
    ) {
      this.actionGroupItemSelected.emit(
        this.el as HTMLChActionGroupItemElement
      );
    }
    /*  this.actionGroupItemKeyDown.emit({ event, item: this.el }); */
  };

  render() {
    return (
      <Host
        role="none"
        tabindex={!this.disabled ? "0" : "-1"}
        class={{
          [this.cssClass]: !!this.cssClass && this.disposedTop,
          [this.groupedClass]: !!this.groupedClass && !this.disposedTop,
          "first-level-action": this.disposedTop,
          hover: !this.deactivated,
          hidden: !this.presented
          // hydrated: !this.disabled,
        }}
      >
        <a
          tabindex="-1"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={(!this.deactivated).toString()}
          href={this.link ? this.link : null}
          ref={aElement => (this.a = aElement as HTMLElement)}
          part="link"
        >
          <slot></slot>
        </a>
        {/*  <slot name="menu"></slot> */}
      </Host>
    );
  }
}

export interface ActionGroupItemTargetEvent {
  active: boolean;
  item: HTMLChActionGroupItemElement;
}

export interface ActionGroupItemKeyDownEvent {
  event: KeyboardEvent;
  item: HTMLChActionGroupItemElement;
}
