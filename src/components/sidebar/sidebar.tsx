import {
  Component,
  Element,
  Event,
  EventEmitter,
  Prop,
  Host,
  h,
  Watch
} from "@stencil/core";
import {
  addObservable,
  notifySubscribers,
  removeObservable
} from "./expanded-change-obervables";

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

  /**
   *
   */
  @Prop() readonly expandButtonAccessibleName: string;

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
  @Prop() readonly showExpandButton: boolean = true;

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

  connectedCallback() {
    this.#sidebarId ||= `ch-sidebar-${autoId++}`;

    // The ID MUST be set in this instance, because when searching for the
    // ancestors in `syncStateWithObservableAncestors` we use the DOM id and
    // the method could be executed before the first render of the sidebar,
    // where we typically attach the Host attributes, in this case, the id attr
    this.el.id = this.#sidebarId;

    addObservable(this.#sidebarId, this.expanded);
    notifySubscribers(this.#sidebarId, this.expanded); // Must run after the ID and the observable has been configured
  }

  disconnectedCallback() {
    removeObservable(this.#sidebarId);
  }

  render() {
    return (
      <Host
        class={this.expanded ? "ch-sidebar--expanded" : "ch-sidebar--collapsed"}
      >
        <slot />

        {this.showExpandButton && (
          <button
            aria-label={this.expandButtonAccessibleName}
            part={`expand-button ${this.expanded ? "expanded" : "collapsed"}`}
            type="button"
            onClick={this.#handleExpandedChange}
          >
            Expand
          </button>
        )}
      </Host>
    );
  }
}
