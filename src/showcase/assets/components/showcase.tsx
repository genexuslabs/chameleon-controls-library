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
  ComboBoxModel,
  FlexibleLayoutModel,
  FlexibleLayoutRenders,
  RadioGroupModel
} from "../../../components";

const MAIN_WIDGET = "main";
const CONFIGURATION_WIDGET = "configuration";

const flexibleLayoutConfiguration: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: MAIN_WIDGET,
      size: "1fr",
      minSize: "220px",
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
          model: ComboBoxModel;
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
          model: RadioGroupModel;
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
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      // Initialize state
      showcaseStoryState[propertyGroupId as any] = property.value;

      if (property.render === "switch") {
        // TODO
      }
      // Checkbox by default
      else {
        this.#showcaseStoryCheckboxes ??= new Map();

        this.#showcaseStoryCheckboxes.set(propertyGroupId, () => {
          const checkboxCurrentValue = showcaseStoryState[
            propertyGroupId as any
          ] as boolean;

          showcaseStoryState[propertyGroupId as any] = !checkboxCurrentValue;

          // Verify if the checkbox is inside of an object
          if (parentObject) {
            const oldGroupInfo = showcaseStoryState[parentObject.id as any];

            showcaseStoryState[parentObject.id as any] = {
              ...oldGroupInfo,
              [property.id]: !checkboxCurrentValue
            };
          }
          forceUpdate(this);
        });
      }
    },

    enum: (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      // Initialize state
      showcaseStoryState[propertyGroupId as any] = property.value;

      const eventHandler = (
        event:
          | ChRadioGroupRenderCustomEvent<string>
          | ChComboBoxCustomEvent<string>
          | InputEvent
      ) => {
        showcaseStoryState[propertyGroupId as any] = event.detail;

        // Verify if the combo-box/radio-group is inside of an object
        if (parentObject) {
          const oldGroupInfo = showcaseStoryState[parentObject.id as any];

          showcaseStoryState[parentObject.id as any] = {
            ...oldGroupInfo,
            [property.id]: event.detail
          };
        }
        forceUpdate(this);
      };

      // Radio Group
      if (property.render === "radio-group") {
        this.#showcaseStoryRadioGroups ??= new Map();
        this.#showcaseStoryRadioGroups.set(propertyGroupId, {
          handler: eventHandler,
          model: property.values
        });
      }
      // Combo Box by default
      else {
        this.#showcaseStoryComboBoxes ??= new Map();
        this.#showcaseStoryComboBoxes.set(propertyGroupId, {
          handler: eventHandler,
          model: property.values
        });
      }
    },

    number: (
      property: ShowcaseRenderPropertyNumber<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      // Initialize state
      showcaseStoryState[propertyGroupId as any] = property.value;

      this.#showcaseStoryInputNumber ??= new Map();

      this.#showcaseStoryInputNumber.set(
        propertyGroupId,
        (event: InputEvent) => {
          const inputCurrentValue = (event.target as HTMLInputElement).value;
          showcaseStoryState[propertyGroupId as any] = inputCurrentValue;

          // Verify if the input-number is inside of an object
          if (parentObject) {
            const oldGroupInfo = showcaseStoryState[parentObject.id as any];

            showcaseStoryState[parentObject.id as any] = {
              ...oldGroupInfo,
              [property.id]: inputCurrentValue
            };
          }
          forceUpdate(this);
        }
      );
    },

    object: (
      property: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;

      // Initialize the state as an empty object
      showcaseStoryState[property.id as any] = {};
    },

    string: (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      // Initialize state
      showcaseStoryState[propertyGroupId as any] = property.value;

      this.#showcaseStoryInput ??= new Map();

      this.#showcaseStoryInput.set(propertyGroupId, (event: InputEvent) => {
        const inputCurrentValue = (event.target as HTMLInputElement).value;

        showcaseStoryState[propertyGroupId as any] = inputCurrentValue;

        // Verify if the input-number is inside of an object
        if (parentObject) {
          const oldGroupInfo = showcaseStoryState[parentObject.id as any];

          showcaseStoryState[parentObject.id as any] = {
            ...oldGroupInfo,
            [property.id]: inputCurrentValue
          };
        }
        forceUpdate(this);
      });
    }
  } as const satisfies {
    [key in ShowcaseRenderPropertyTypes]: (
      property: ShowcaseRenderProperty<ShowcaseAvailableStories>
    ) => void;
  };

  #getPropertyId = (
    property: ShowcaseRenderProperty<ShowcaseAvailableStories>,
    parentObject?: ShowcaseRenderPropertyObject<
      ShowcaseAvailableStories,
      keyof ShowcaseAvailableStories
    >
  ) => (parentObject ? `${parentObject.id}_${property.id}` : property.id);

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
   * Specifies the theme used in the iframe of the control
   */
  @Prop() readonly colorScheme: "light" | "dark";
  @Watch("colorScheme")
  colorSchemeChange(newColorSchemeValue: "light" | "dark") {
    // The showcase does not render a iframe
    if (this.#showcaseStory) {
      return;
    }

    this.#iframeRef.contentWindow.postMessage(
      newColorSchemeValue,
      `${window.location.origin}/${this.pageSrc}`
    );
  }

  /**
   * Specifies the name of the control.
   */
  @Prop() readonly componentName: string;
  @Watch("componentName")
  componentNameChange(newComponentName: string) {
    this.#checkShowcaseStoryMapping(newComponentName);
  }

  /**
   * Specifies the design system used in the iframe of the control
   */
  @Prop() readonly designSystem: "mercury" | "unanimo";
  @Watch("designSystem")
  designSystemChange(newDSValue: "mercury" | "unanimo") {
    // The showcase does not render a iframe
    if (this.#showcaseStory) {
      return;
    }

    this.#iframeRef.contentWindow.postMessage(
      newDSValue,
      `${window.location.origin}/${this.pageSrc}`
    );
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
   * Specifies the development status of the control.
   *   - "experimental": The control is in its early stages of the development.
   *     This phase is often useful for testing the control early, but it is
   *     very likely that the interface will change from the final version.
   *
   *     Breaking changes for the control can be applied in "patch" tags.
   *
   *   - "developer-preview": The control is in its final stages of the
   *     development. The interface and behaviors to implement the control are
   *     almost complete. The interface of the control should not change so much
   *     from the final version.
   *
   *     Breaking changes for the control can be applied in "major" tags.
   *
   *   - "stable": The control's development is stable and can be safety used
   *     in production environments.
   *
   *     Breaking changes for the control can be applied in "major" tags. In
   *     some cases, two "major" tags would be used to deprecate a behavior in
   *     the control.
   */
  @Prop() readonly status: "developer-preview" | "experimental" | "stable";

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

      // Initialize state with default values
      properties.forEach(group => {
        group.properties.forEach(property =>
          this.#initializePropertyInState(property)
        );
      });
    }
  };

  #initializePropertyInState = (
    property: ShowcaseRenderProperty<ShowcaseAvailableStories>,
    object?: ShowcaseRenderPropertyObject<
      ShowcaseAvailableStories,
      keyof ShowcaseAvailableStories
    >
  ) => {
    if (property.type === "object") {
      // Initialize the object
      this.#handlerInitializationMapping[property.type](property as any);

      // Initialize all object properties. "property" in this case is the "object"
      property.properties.forEach(childProperty =>
        this.#initializePropertyInState(childProperty as any, property)
      );
    } else {
      // TODO: Improve type inference
      this.#handlerInitializationMapping[property.type](
        property as any,
        object
      );
    }
  };

  #customShowcaseRender = () => (
    <ch-flexible-layout-render
      model={flexibleLayoutConfiguration}
      renders={this.#flexibleLayoutRender}
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

      {this.#renderProperties(group.properties)}
    </fieldset>
  ];

  #renderProperties = (
    properties: ShowcaseRenderProperty<any>[],
    object?: ShowcaseRenderPropertyObject<
      ShowcaseAvailableStories,
      keyof ShowcaseAvailableStories
    >
  ) =>
    properties.map(property =>
      this.#propertyRender[
        property.render ?? defaultRenderForEachPropertyType[property.type]
      ](property, object)
    );

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
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => (
      <ch-checkbox
        accessibleName={property.accessibleName}
        caption={property.caption}
        class="checkbox"
        style={
          property.columnSpan
            ? { "grid-column": `1 / ${property.columnSpan + 1}` }
            : null
        }
        checkedValue="true"
        unCheckedValue="false"
        value={property.value.toString()}
        onInput={this.#showcaseStoryCheckboxes.get(
          this.#getPropertyId(property, parentObject)
        )}
      ></ch-checkbox>
    ),

    "combo-box": (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <ch-combo-box
          id={propertyGroupId}
          accessibleName={property.accessibleName}
          class="combo-box"
          model={this.#showcaseStoryComboBoxes.get(propertyGroupId).model}
          value={property.value.toString()}
          onInput={this.#showcaseStoryComboBoxes.get(propertyGroupId).handler}
        ></ch-combo-box>
      ]);
    },

    input: (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <input
          id={propertyGroupId}
          aria-label={property.accessibleName ?? null}
          class="form-input"
          type="text"
          value={property.value?.toString()}
          onInput={this.#showcaseStoryInput.get(propertyGroupId)}
        />
      ]);
    },

    "input-number": (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <input
          id={propertyGroupId}
          aria-label={property.accessibleName ?? null}
          class="form-input"
          type="number"
          value={property.value?.toString()}
          onInput={this.#showcaseStoryInputNumber.get(propertyGroupId)}
        />
      ]);
    },

    "independent-properties": (
      property: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => this.#renderProperties(property.properties, property),

    "radio-group": (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <ch-radio-group-render
          id={propertyGroupId}
          aria-label={property.accessibleName ?? null}
          class="radio-group"
          model={this.#showcaseStoryRadioGroups.get(propertyGroupId).model}
          value={property.value.toString()}
          onChange={this.#showcaseStoryRadioGroups.get(propertyGroupId).handler}
        ></ch-radio-group-render>
      ]);
    },

    textarea: (
      property: ShowcaseRenderPropertyString<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseAvailableStories,
        keyof ShowcaseAvailableStories
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <textarea
          id={propertyGroupId}
          aria-label={property.accessibleName ?? null}
          class="form-input"
          value={property.value.toString()}
          onInput={this.#showcaseStoryInput.get(propertyGroupId)}
        ></textarea>
      ]);
    }
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
    if (!this.pageSrc || !this.componentName) {
      return "";
    }

    return (
      <Host>
        <h1 class="heading-1">
          {this.pageName} {this.status}
        </h1>

        {this.#showcaseStory
          ? this.#customShowcaseRender()
          : this.#iframeRender()}
      </Host>
    );
  }
}
