import { Component, Host, h, Prop, State } from "@stencil/core";
import { SuggestData } from "../../suggest/ch-suggest";
import { convertObjectDataToSuggestData } from "./helpers";
import { renderSuggestLists } from "./renderSuggest";

@Component({
  tag: "ch-test-suggest",
  styleUrl: "test-suggest.css",
  shadow: true
})
export class ChTestSuggest {
  /*
INDEX:
1.OWN PROPERTIES
2.REFERENCE TO ELEMENTS
3.STATE() VARIABLES
4.PUBLIC PROPERTY API | WATCH'S
5.EVENTS (EMIT)
6.COMPONENT LIFECYCLE EVENTS
7.LISTENERS
8.PUBLIC METHODS API
9.LOCAL METHODS
10.RENDER() FUNCTION
*/

  // 1.OWN PROPERTIES //

  // 2. REFERENCE TO ELEMENTS //

  // 3.STATE() VARIABLES //

  /**
   * The objects suggestions that will appear on the suggest
   */
  @State() objectsSuggestions: SuggestData;

  // 4.PUBLIC PROPERTY API | WATCH'S //

  /**
   * Callback invoked when user writes on object selector input, return possible options to show in autocomplete list
   */
  @Prop() readonly selectorSourceCallback?: (
    prefix: string
  ) => Promise<SelectorCategoryData[]>;

  // 5.EVENTS (EMIT) //

  // 6.COMPONENT LIFECYCLE EVENTS //

  // 7.LISTENERS //

  // 8.PUBLIC METHODS API //

  // 9.LOCAL METHODS //

  /**
   * This handler gets fired every time the value of the 'Select Object' ch-suggest changes.
   */
  private selectObjectValueChangedHandler = async (e: CustomEvent<string>) => {
    const value = e.detail;
    this.selectorSourceCallback(value)
      .then(result => {
        /* show suggestions*/
        this.objectsSuggestions = convertObjectDataToSuggestData(result);
      })
      .catch(() => {
        // to do
      });
  };

  // 10.RENDER() FUNCTION //

  render() {
    return (
      <Host>
        <ch-suggest
          onValueChanged={this.selectObjectValueChangedHandler}
          part="object-selector-suggest"
          exportparts="dropdown:select-object-dropdown"
        >
          {renderSuggestLists(this.objectsSuggestions)}
        </ch-suggest>
      </Host>
    );
  }
}

export type SelectorCategoryData = {
  name: string;
  items: ObjectData[];
};

export type ObjectData = {
  id: string;
  icon: string;
  name: string;
  description?: string;
};
