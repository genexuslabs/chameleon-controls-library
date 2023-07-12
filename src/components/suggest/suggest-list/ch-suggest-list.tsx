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

  /*** 1.OWN PROPERTIES ***/

  /**
   * The label
   */
  @Prop() readonly label: string;

  /*** 2.REFERENCE TO ELEMENTS ***/

  /*** 3.STATE() VARIABLES ***/

  /*** 4.PUBLIC PROPERTY API ***/

  /*** 5.EVENTS (EMIT) ***/

  /*** 6.COMPONENT LIFECYCLE EVENTS ***/

  /*** 7.LISTENERS ***/

  /*** 8.PUBLIC METHODS API ***/

  /*** 9.LOCAL METHODS ***/

  private renderId = (): string =>
    this.label ? this.label.toLocaleLowerCase().replace(" ", "-") : null;

  /*** 10.RENDER() FUNCTION ***/

  render() {
    return (
      <Host role="list">
        {this.label ? (
          <h2 id={this.renderId()} part="title" class="title">
            {this.label}
          </h2>
        ) : null}
        <ul aria-labelledby={this.renderId()} part="list" class="list">
          <slot></slot>
        </ul>
      </Host>
    );
  }
}
