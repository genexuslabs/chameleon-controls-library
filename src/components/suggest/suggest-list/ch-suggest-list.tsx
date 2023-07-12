import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-suggest-list",
  styleUrl: "ch-suggest-list.scss",
  shadow: true
})
export class ChSuggestList {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API
5.EVENTS (EMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.PUBLIC METHODS API
9.LOCAL METHODS
10.RENDER() FUNCTION
*/

  /// 1.OWN PROPERTIES ///

  /**
   * The label
   */
  @Prop() readonly label: string;

  /// 2.REFERENCE TO ELEMENTS ///

  /// 3.STATE() VARIABLES ///

  /// 4.PUBLIC PROPERTY API ///

  /// 5.EVENTS (EMIT) ///

  /// 6.COMPONENT LIFECYCLE EVENTS ///

  /// 7.LISTENERS ///

  /// 8.PUBLIC METHODS API ///

  /// 9.LOCAL METHODS ///

  /// 10.RENDER() FUNCTION ///

  render() {
    return (
      <Host>
        {this.label && (
          <h2 id="heading" part="title" class="title">
            {this.label}
          </h2>
        )}
        <ul
          aria-labelledby={this.label ? "heading" : undefined}
          part="list"
          class="list"
        >
          <slot></slot>
        </ul>
      </Host>
    );
  }
}
