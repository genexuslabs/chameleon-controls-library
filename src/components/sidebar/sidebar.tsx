import {
  Component,
  Element,
  Event,
  EventEmitter,
  Prop,
  Host,
  h,
  Watch,
  State
} from "@stencil/core";
import {
  addObservable,
  notifySubscribers,
  removeObservable
} from "./expanded-change-obervables";
import {
  isRTL,
  subscribeToRTLChanges,
  unsubscribeToRTLChanges
} from "../../common/utils";

let autoId = 0;

@Component({
  shadow: true,
  styleUrl: "sidebar.scss",
  tag: "ch-sidebar"
})
export class ChSidebar {
  /**
   * This ID is used to identify the control. Useful when the expandedChange
   * event is fired and the subscribed nodes travel all the tree up to the root
   * searching for the ID that emitted the expandedChange event.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #sidebarId: string;

  @Element() el: HTMLChSidebarElement;

  @State() rtl: boolean = false;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for expand button when `expanded = true`.
   */
  @Prop() readonly expandButtonCollapseAccessibleName?: string;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for expand button when `expanded = false`.
   */
  @Prop() readonly expandButtonExpandAccessibleName?: string;

  /**
   * Specifies the caption of the expand button when `expanded = true`.
   */
  @Prop() readonly expandButtonCollapseCaption?: string;

  /**
   * Specifies the caption of the expand button when `expanded = false`.
   */
  @Prop() readonly expandButtonExpandCaption?: string;

  /**
   * Specifies whether the control is expanded or collapsed.
   */
  @Prop({ mutable: true }) expanded: boolean = true;
  @Watch("expanded")
  expandedChanged(newValue: boolean) {
    notifySubscribers(this.#sidebarId, newValue);
  }

  /**
   * `true` to display a expandable button at the bottom of the control.
   */
  @Prop() readonly showExpandButton: boolean = false;

  /**
   * Emitted when the element is clicked or the space key is pressed and
   * released.
   */
  @Event() expandedChange: EventEmitter<boolean>;

  #handleExpandedChange = (event: MouseEvent) => {
    event.stopPropagation();

    const newExpandedValue = !this.expanded;
    this.expanded = newExpandedValue;

    this.expandedChange.emit(newExpandedValue);
  };

  #updatePositionWithRTL = (rtl: boolean) => {
    this.rtl = rtl;
  };

  connectedCallback() {
    this.#sidebarId ??= `ch-sidebar-${autoId++}`;

    // The ID MUST be set in this instance, because when searching for the
    // ancestors in `syncStateWithObservableAncestors` we use the DOM id and
    // the method could be executed before the first render of the sidebar,
    // where we typically attach the Host attributes, in this case, the id attr
    this.el.id = this.#sidebarId;

    addObservable(this.#sidebarId, this.expanded);
    notifySubscribers(this.#sidebarId, this.expanded); // Must run after the ID and the observable has been configured

    // Set RTL watcher
    subscribeToRTLChanges(this.#sidebarId, this.#updatePositionWithRTL);

    // Initialize RTL position
    this.#updatePositionWithRTL(isRTL());
  }

  disconnectedCallback() {
    removeObservable(this.#sidebarId);

    // Disconnect RTL watcher to avoid memory leaks
    unsubscribeToRTLChanges(this.#sidebarId);
  }

  render() {
    const accessibleName = this.expanded
      ? this.expandButtonCollapseAccessibleName
      : this.expandButtonExpandAccessibleName;

    const caption = this.expanded
      ? this.expandButtonCollapseCaption
      : this.expandButtonExpandCaption;

    return (
      <Host
        class={this.expanded ? "ch-sidebar--expanded" : "ch-sidebar--collapsed"}
      >
        <slot />

        {this.showExpandButton && (
          <button
            aria-label={accessibleName !== caption ? accessibleName : undefined}
            class={{
              "expand-button": true,
              "expand-button--collapsed": !this.expanded,
              "expand-button--rtl": this.rtl
            }}
            part={`expand-button ${this.expanded ? "expanded" : "collapsed"}`}
            type="button"
            onClick={this.#handleExpandedChange}
          >
            {caption}
          </button>
        )}
      </Host>
    );
  }
}
