import { Component, Prop, Host, Watch, h, forceUpdate } from "@stencil/core";
import {
  ShowcaseAvailableStories,
  ShowcaseRenderProperty,
  ShowcaseRenderPropertyBoolean,
  ShowcaseRenderPropertyEnum,
  ShowcaseRenderPropertyGroup,
  ShowcaseRenderPropertyNumber,
  ShowcaseRenderPropertyObject,
  ShowcaseRenderPropertyString,
  ShowcaseRenderPropertyTypes,
  ShowcaseStory
} from "./types";
import { showcaseStories } from "./showcase-stories";
import {
  ChComboBoxCustomEvent,
  ChRadioGroupRenderCustomEvent,
  ComboBoxItemModel,
  FlexibleLayout,
  FlexibleLayoutRenders,
  RadioItem
} from "../../../../components";

const MAIN_WIDGET = "main";
const CONFIGURATION_WIDGET = "configuration";

const flexibleLayoutConfiguration: FlexibleLayout = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: MAIN_WIDGET,
      size: "1fr",
      minSize: "200px",
      type: "single-content",
      widget: { id: MAIN_WIDGET, name: null }
    },
    {
      id: CONFIGURATION_WIDGET,
      size: "320px",
      minSize: "250px",
      type: "single-content",
      widget: { id: CONFIGURATION_WIDGET, name: null }
    }
  ]
};

const defaultRenderForEachPropertyType = {
  boolean: "checkbox",
  enum: "combo-box",
  number: "input-number",
  string: "input",
  object: "independent-properties"
} as const;

@Component({
  shadow: false,
  styleUrl: "showcase.scss",
  tag: "ch-showcase"
})
export class ChShowcase {
  #showcaseStory: ShowcaseStory<ShowcaseAvailableStories> | undefined;
  #showcaseStoryCheckboxes: Map<string, () => void> | undefined;
  #showcaseStoryComboBoxes:
    | Map<
        string,
        {
          items: ComboBoxItemModel[];
          handler: (event: ChComboBoxCustomEvent<string> | InputEvent) => void;
        }
      >
    | undefined;

  #showcaseStoryInput: Map<string, (event: InputEvent) => void> | undefined;
  #showcaseStoryInputNumber:
    | Map<string, (event: InputEvent) => void>
    | undefined;
  #showcaseStoryRadioGroups:
    | Map<
        string,
        {
          items: RadioItem[];
          handler: (
            event: ChRadioGroupRenderCustomEvent<string> | InputEvent
          ) => void;
        }
      >
    | undefined;

  #handlerInitializationMapping = {
    boolean: (
      property: ShowcaseRenderPropertyBoolean<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;

      if (property.render === "switch") {
        // TODO
      }
      // Checkbox by default
      else {
        this.#showcaseStoryCheckboxes ??= new Map();

        this.#showcaseStoryCheckboxes.set(property.id, () => {
          const checkboxCurrentValue = showcaseStoryState[
            property.id as any
          ] as boolean;

          showcaseStoryState[property.id as any] = !checkboxCurrentValue;
          forceUpdate(this);
        });
      }
    },

    enum: (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;

      // Radio Group
      if (property.render === "radio-group") {
        this.#showcaseStoryRadioGroups ??= new Map();
        this.#showcaseStoryRadioGroups.set(property.id, {
          handler: event => {
            showcaseStoryState[property.id as any] = event.detail;
            forceUpdate(this);
          },
          items: property.values
        });
      }
      // Combo Box by default
      else {
        this.#showcaseStoryComboBoxes ??= new Map();
        this.#showcaseStoryComboBoxes.set(property.id, {
          handler: event => {
            showcaseStoryState[property.id as any] = event.detail;
            forceUpdate(this);
          },
          items: property.values
        });
      }
    },

    number: (
      property: ShowcaseRenderPropertyNumber<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      this.#showcaseStoryInputNumber ??= new Map();

      this.#showcaseStoryInputNumber.set(property.id, (event: InputEvent) => {
        const inputCurrentValue = (event.target as HTMLInputElement).value;

        showcaseStoryState[property.id as any] = inputCurrentValue;
        forceUpdate(this);
      });
    },

    object: (
      property: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;

      console.log(property, showcaseStoryState);
      // this.#showcaseStoryInputNumber ??= new Map();

      // this.#showcaseStoryInputNumber.set(property.id, (event: InputEvent) => {
      //   const inputCurrentValue = (event.target as HTMLInputElement).value;

      //   showcaseStoryState[property.id as any] = inputCurrentValue;
      //   forceUpdate(this);
      // });
    },

    string: (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      this.#showcaseStoryInput ??= new Map();

      if (property.render === "textarea") {
        // TODO
      }
      // Input by default
      else {
        this.#showcaseStoryInput.set(property.id, (event: InputEvent) => {
          const inputCurrentValue = (event.target as HTMLInputElement).value;

          showcaseStoryState[property.id as any] = inputCurrentValue;
          forceUpdate(this);
        });
      }
    }
  } as const satisfies {
    [key in ShowcaseRenderPropertyTypes]: (
      property: ShowcaseRenderProperty<ShowcaseAvailableStories>
    ) => void;
  };

  #flexibleLayoutRender: FlexibleLayoutRenders = {
    [MAIN_WIDGET]: () => (
      <div key={MAIN_WIDGET} slot={MAIN_WIDGET} class="card">
        {this.#showcaseStory.render()}
      </div>
    ),
    [CONFIGURATION_WIDGET]: () => (
      <div
        key={CONFIGURATION_WIDGET}
        slot={CONFIGURATION_WIDGET}
        class="card card-properties"
      >
        {this.#showcaseStory.properties.map(this.#propertyGroupRender)}
      </div>
    )
  };

  // Refs
  #iframeRef: HTMLIFrameElement;
  #flexibleLayoutRef: HTMLChFlexibleLayoutRenderElement | undefined;

  /**
   * Specifies the name of the control.
   */
  @Prop() readonly componentName: string;
  @Watch("componentName")
  componentNameChange(newComponentName: string) {
    this.#checkShowcaseStoryMapping(newComponentName);
  }

  /**
   * Specifies the title for the current showcase.
   */
  @Prop() readonly pageName: string;

  /**
   * Specifies the HTML directory where the showcase for the control is placed.
   */
  @Prop() readonly pageSrc: string;

  /**
   * Specifies the theme used in the iframe of the control
   */
  @Prop() readonly theme: "light" | "dark";
  @Watch("theme")
  themeChange(newThemeValue: "light" | "dark") {
    // The showcase does not render a iframe
    if (this.#showcaseStory) {
      return;
    }

    this.#iframeRef.contentWindow.postMessage(
      newThemeValue,
      `${window.location.origin}/${this.pageSrc}`
    );
  }

  #checkShowcaseStoryMapping = (componentName: string) => {
    this.#showcaseStoryCheckboxes = undefined; // Free the memory
    this.#showcaseStoryComboBoxes = undefined; // Free the memory
    this.#showcaseStoryInput = undefined; // Free the memory
    this.#showcaseStoryInputNumber = undefined; // Free the memory
    this.#showcaseStoryRadioGroups = undefined; // Free the memory

    this.#showcaseStory = componentName
      ? showcaseStories[componentName]
      : undefined;

    if (this.#showcaseStory) {
      const properties = this.#showcaseStory.properties;
      const state = this.#showcaseStory.state;

      // Initialize state with default values
      properties.forEach(group => {
        group.properties.forEach(property => {
          if (property.type !== "object") {
            state[property.id as any] = property.value;

            // TODO: Improve type inference
            this.#handlerInitializationMapping[property.type](property as any);
          }
        });
      });
    }
  };

  #customShowcaseRender = () => (
    <ch-flexible-layout-render
      renders={this.#flexibleLayoutRender}
      layout={flexibleLayoutConfiguration}
      ref={el => (this.#flexibleLayoutRef = el)}
    ></ch-flexible-layout-render>
  );

  #propertyGroupRender = (
    group: ShowcaseRenderPropertyGroup<ShowcaseAvailableStories>,
    index: number
  ) => [
    index !== 0 && <hr />,
    <fieldset
      style={
        group.columns
          ? { "grid-template-columns": `repeat(${group.columns}, 1fr)` }
          : null
      }
    >
      <legend class="heading-4">{group.caption}</legend>

      {group.properties.map(property =>
        this.#propertyRender[
          property.render ?? defaultRenderForEachPropertyType[property.type]
        ](property)
      )}
    </fieldset>
  ];

  #propertyRenderWithLabel = (
    property: ShowcaseRenderProperty<ShowcaseAvailableStories>,
    content: any
  ) => (
    <div
      class="form-field"
      style={
        property.columnSpan
          ? { "grid-column": `1 / ${property.columnSpan + 1}` }
          : null
      }
    >
      {content}
    </div>
  );

  #propertyRender = {
    checkbox: (
      property: ShowcaseRenderPropertyBoolean<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => (
      <ch-checkbox
        accessibleName={property.accessibleName}
        caption={property.caption}
        class="checkbox"
        checkedValue="true"
        unCheckedValue="false"
        value={property.value.toString()}
        onInput={this.#showcaseStoryCheckboxes.get(property.id)}
      ></ch-checkbox>
    ),

    "combo-box": (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) =>
      this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={property.id}>
            {property.caption}
          </label>
        ),
        <ch-combo-box
          id={property.id}
          accessibleName={property.accessibleName}
          class="combo-box"
          items={this.#showcaseStoryComboBoxes.get(property.id).items}
          value={property.value.toString()}
          onInput={this.#showcaseStoryComboBoxes.get(property.id).handler}
        ></ch-combo-box>
      ]),

    input: (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) =>
      this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={property.id}>
            {property.caption}
          </label>
        ),
        <input
          id={property.id}
          aria-label={property.accessibleName ?? null}
          class="form-input"
          type="text"
          value={property.value.toString()}
          onInput={this.#showcaseStoryInput.get(property.id)}
        />
      ]),

    "input-number": (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) =>
      this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={property.id}>
            {property.caption}
          </label>
        ),
        <input
          id={property.id}
          aria-label={property.accessibleName ?? null}
          class="form-input"
          type="number"
          value={property.value.toString()}
          onInput={this.#showcaseStoryInputNumber.get(property.id)}
        />
      ]),

    "radio-group": (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) =>
      this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={property.id}>
            {property.caption}
          </label>
        ),
        <ch-radio-group-render
          id={property.id}
          aria-label={property.accessibleName ?? null}
          class="radio-group"
          items={this.#showcaseStoryRadioGroups.get(property.id).items}
          value={property.value.toString()}
          onChange={this.#showcaseStoryRadioGroups.get(property.id).handler}
        ></ch-radio-group-render>
      ])
  } as const;

  #iframeRender = () => (
    <iframe
      src={this.pageSrc}
      frameborder="0"
      ref={el => (this.#iframeRef = el)}
    ></iframe>
  );

  connectedCallback() {
    this.#checkShowcaseStoryMapping(this.componentName);
  }

  componentDidUpdate() {
    if (this.#flexibleLayoutRef) {
      forceUpdate(this.#flexibleLayoutRef);
    }
  }

  render() {
    if (!this.pageSrc && !this.componentName) {
      return "";
    }

    return (
      <Host>
        <h1 class="heading-1">{this.pageName}</h1>

        {this.#showcaseStory
          ? this.#customShowcaseRender()
          : this.#iframeRender()}
      </Host>
    );
  }
}
