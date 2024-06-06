import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  h
} from "@stencil/core";

const EXPANDABLE_ID = "expandable";

@Component({
  tag: "ch-action-list-group",
  styleUrl: "action-list-group.scss",
  shadow: true
})
export class ChActionListGroup {
  @Element() el: HTMLChActionListGroupElement;

  /**
   * This attributes specifies the caption of the control
   */
  @Prop() readonly caption: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @Prop({ mutable: true }) downloading = false;

  /**
   * This attribute lets you specify if the edit operation is enabled in the
   * control. If `true`, the control can edit its caption in place.
   */
  @Prop() readonly editable: boolean;

  // /**
  //  * Specifies what kind of expandable button is displayed.
  //  * Only works if `leaf === false`.
  //  *  - `"expandableButton"`: Expandable button that allows to expand/collapse
  //  *     the items of the control.
  //  *  - `"decorative"`: Only a decorative icon is rendered to display the state
  //  *     of the item.
  //  */
  // @Prop() readonly expandableButton: "action" | "decorative" | "no" =
  //   "decorative";

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @Prop() readonly expandable?: boolean;

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @Prop({ mutable: true }) expanded?: boolean;
  // @Watch("expanded")
  // expandedChanged(isExpanded: boolean) {
  //   // Wait until all properties are updated before lazy loading. Otherwise, the
  //   // lazyLoad property could be updated just after the executing of the function
  //   setTimeout(() => {
  //     this.#lazyLoadItems(isExpanded);
  //   });
  // }

  /**
   * Determine if the items are lazy loaded when opening the first time the
   * control.
   */
  @Prop({ mutable: true }) lazyLoad = false;

  /**
   * `true` if the checkbox's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate = false;

  /**
   * This attribute represents additional info for the control that is included
   * when dragging the item.
   */
  @Prop() readonly metadata: string;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @Prop() readonly parts?: string;
  // @Watch("parts")
  // partsChanged(newParts: string) {
  //   this.#setExportParts(newParts);
  // }

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @Prop() readonly showDownloadingSpinner: boolean = true;

  // /**
  //  * Fired when the checkbox value of the control is changed.
  //  */
  // @Event() checkboxChange: EventEmitter<TreeViewItemCheckedInfo>;

  // /**
  //  * Fired when the checkbox value of the control is changed. This event only
  //  * applies when the control has `toggleCheckboxes = true`
  //  */
  // @Event() checkboxToggleChange: EventEmitter<TreeViewItemCheckedInfo>;

  // /**
  //  * Fired when the item is being dragged.
  //  */
  // @Event() itemDragStart: EventEmitter<TreeViewItemDragStartInfo>;

  /**
   * Fired when the lazy control is expanded an its content must be loaded.
   */
  @Event() loadLazyContent: EventEmitter<string>;

  // /**
  //  * Fired when the item is asking to modify its caption.
  //  */
  // @Event() modifyCaption: EventEmitter<TreeViewItemNewCaption>;

  // /**
  //  * Fired when the selected state is updated by user interaction on the
  //  * control.
  //  */
  // @Event() selectedItemChange: EventEmitter<TreeViewItemSelected>;

  #getExpandedValue = () =>
    this.expandable ? (this.expanded ?? true).toString() : "true";

  connectedCallback() {
    this.el.setAttribute("role", "listitem");
    this.el.setAttribute("exportparts", "item__action");
  }

  render() {
    const hasContent = !this.lazyLoad;
    const expanded = hasContent && this.#getExpandedValue();

    return (
      <Host role="listitem">
        {this.expandable ? (
          <button
            aria-controls={hasContent ? EXPANDABLE_ID : null}
            aria-expanded={hasContent ? expanded : null}
            class="action"
            part="item__action"
            type="button"
          >
            {this.caption}
          </button>
        ) : (
          <span
            aria-controls={hasContent ? EXPANDABLE_ID : null}
            aria-expanded={hasContent ? expanded : null}
            class="action"
            part="item__action"
          >
            {this.caption}
          </span>
        )}

        {hasContent && (
          <ul
            aria-busy={(!!this.downloading).toString()}
            aria-live={this.downloading ? "polite" : null}
            class={{
              expandable: true,
              "expandable--collapsed": !expanded,
              "expandable--lazy-loaded": !this.downloading
            }}
            id={EXPANDABLE_ID}
          >
            <slot />
          </ul>
        )}
      </Host>
    );
  }
}
