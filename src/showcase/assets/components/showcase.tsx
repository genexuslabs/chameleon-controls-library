import {
  Component,
  Element,
  forceUpdate,
  Host,
  h,
  Listen,
  Prop,
  State,
  Watch
} from "@stencil/core";
import {
  ShowcaseStoryClass,
  ShowcaseCustomStory,
  ShowcaseRenderProperty,
  ShowcaseRenderPropertyBoolean,
  ShowcaseRenderPropertyEnum,
  ShowcaseRenderPropertyGroup,
  ShowcaseRenderPropertyNumber,
  ShowcaseRenderPropertyObject,
  ShowcaseRenderPropertyString,
  ShowcaseRenderPropertyTypes,
  ShowcaseStory,
  ShowcaseStories,
  ShowcaseRenderPropertyStyle
} from "./types";
import {
  ChComboBoxRenderCustomEvent,
  ChRadioGroupRenderCustomEvent,
  ComboBoxModel,
  FlexibleLayoutRenders,
  ItemLink,
  NavigationListItemModel,
  NavigationListModel,
  RadioGroupModel
} from "../../../components";
import {
  defineControlMarkupWithUIModel,
  defineControlMarkupWithoutUIModel
} from "./utils";
import { registryProperty } from "../../../common/registry-properties";
import { getImagePathCallbackImage } from "./image/models";
import { getImagePathCallbackEdit } from "./edit/models";
import { getImagePathCallbackTreeView } from "./tree-view/models";
import { getAccordionPathCallbackEdit } from "./accordion/models";

import {
  getDesignSystem,
  setDesignSystemInBrowser,
  storeDesignSystem
} from "../../models/ds-manager.js";
import {
  getTheme,
  setThemeInBrowser,
  storeTheme
} from "../../models/theme-manager.js";
import {
  getLanguageDirection,
  storeLanguageDirection,
  setLanguageDirectionInBrowser
} from "../../models/language-manager.js";
import {
  ASIDE_WIDGET,
  colorSchemeModel,
  CONFIGURATION_WIDGET,
  designSystemModel,
  flexibleLayoutConfiguration,
  flexibleLayoutPlaygroundConfiguration,
  HEADER_WIDGET,
  languageDirectionModel,
  MAIN_SECTION,
  MAIN_WIDGET,
  USAGE_STENCIL_JS
} from "./renders";
import { findComponentMetadataUsingURLHash } from "./pages";

registryProperty("getImagePathCallback", {
  "ch-accordion-render": getAccordionPathCallbackEdit,
  "ch-edit": getImagePathCallbackEdit,
  "ch-image": getImagePathCallbackImage,
  "ch-tree-view-render": getImagePathCallbackTreeView
});

// registryControlProperty("getImagePathCallback", "ch-image", getImagePathCallbackImage)

const defaultRenderForEachPropertyType = {
  boolean: "checkbox",
  enum: "combo-box",
  number: "input-number",
  string: "input",
  object: "independent-properties",
  style: "independent-properties"
} as const;

@Component({
  shadow: false,
  styleUrl: "showcase.scss",
  tag: "ch-showcase"
})
export class ChShowcase {
  #storyFirstRender = true;

  #showcaseStory: ShowcaseStory<ShowcaseStoryClass> | undefined;
  #showcaseCustomStory: ShowcaseCustomStory | undefined;
  #showcaseStoryCheckboxes: Map<string, () => void> | undefined;
  #showcaseStoryComboBoxes:
    | Map<
        string,
        {
          model: ComboBoxModel;
          handler: (
            event: ChComboBoxRenderCustomEvent<string> | InputEvent
          ) => void;
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      // Initialize state
      showcaseStoryState[propertyGroupId as any] = property.value;

      const eventHandler = (
        event:
          | ChRadioGroupRenderCustomEvent<string>
          | ChComboBoxRenderCustomEvent<string>
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >
    ) => {
      const showcaseStoryState = this.#showcaseStory.state;

      // Initialize the state as an empty object
      showcaseStoryState[property.id as any] = {};
    },

    style: (property: ShowcaseRenderPropertyStyle) => {
      const showcaseStoryState = this.#showcaseStory.state;

      // Initialize the state as an empty object
      showcaseStoryState[property.id as any] = {};
    },

    string: (
      property: ShowcaseRenderPropertyString<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
      property: ShowcaseRenderProperty<ShowcaseStoryClass>
    ) => void;
  };

  #getPropertyId = (
    property: ShowcaseRenderProperty<ShowcaseStoryClass>,
    parentObject?: ShowcaseRenderPropertyObject<
      ShowcaseStoryClass,
      keyof ShowcaseStoryClass
    >
  ) => (parentObject ? `${parentObject.id}_${property.id}` : property.id);

  #flexibleLayoutRender: FlexibleLayoutRenders = {
    [HEADER_WIDGET]: () => (
      <header key={HEADER_WIDGET} slot={HEADER_WIDGET} class="header">
        <div class="header-start">
          <a
            id="chameleon-home"
            class="home heading-2"
            href="#"
            aria-label="Home"
          >
            Chameleon
          </a>
          <span id="chameleon-version" class="text-body-2">
            {this.packageVersion}
          </span>
        </div>

        <div class="header-end">
          <ch-segmented-control-render
            model={designSystemModel}
            selectedId={this.designSystem}
            onSelectedItemChange={this.#handleDesignSystemChange}
          ></ch-segmented-control-render>

          <ch-segmented-control-render
            model={colorSchemeModel}
            selectedId={this.colorScheme}
            onSelectedItemChange={this.#handleColorSchemeChange}
          ></ch-segmented-control-render>

          <ch-segmented-control-render
            model={languageDirectionModel}
            selectedId={this.languageDirection}
            onSelectedItemChange={this.#handleLanguageDirectionChange}
          ></ch-segmented-control-render>

          <a
            href="https://github.com/genexuslabs/chameleon-controls-library"
            aria-label="Chameleon's GitHub"
            class="icon-background github-logo"
            target="_blank"
            title="Chameleon's GitHub"
          ></a>
        </div>
      </header>
    ),
    [ASIDE_WIDGET]: () => (
      <aside key={ASIDE_WIDGET} slot={ASIDE_WIDGET} class="ch-showcase__aside">
        <input
          type="search"
          class="form-input form-input-search sidebar__search-input"
          aria-label="Search"
          placeholder="Search"
        />

        <ch-navigation-list-render
          class="navigation-list-primary"
          model={this.pages}
          expandSelectedLink
          selectedLink={
            this.componentMetadata?.link
              ? (this.componentMetadata as {
                  id?: string;
                  link: ItemLink;
                })
              : undefined
          }
          selectedLinkIndicator
          expandableButtonPosition="end"
        ></ch-navigation-list-render>
      </aside>
    ),
    [MAIN_SECTION]: () => (
      <main key={MAIN_SECTION} slot={MAIN_SECTION}>
        {this.#renderMainSection()}
      </main>
    )
  };

  #flexibleLayoutPlaygroundRenders: FlexibleLayoutRenders = {
    [MAIN_WIDGET]: () => (
      <div key={MAIN_WIDGET} slot={MAIN_WIDGET} class="card">
        {this.#showcaseStory.render()}
      </div>
    ),
    [USAGE_STENCIL_JS]: () => (
      <div
        key={USAGE_STENCIL_JS}
        slot={USAGE_STENCIL_JS}
        class="card card-markup"
      >
        <button
          class="button-tertiary button-icon-only copy-button icon-mask"
          title="Copy markup"
          type="button"
          onClick={this.#handleCopyMarkup}
          ref={el => (this.#copyButtonRef = el)}
        ></button>
        <ch-code
          key={USAGE_STENCIL_JS}
          slot={USAGE_STENCIL_JS}
          class="code"
          language="typescript"
          value={
            this.#showcaseStory.markupWithUIModel
              ? defineControlMarkupWithUIModel(
                  this.#showcaseStory.markupWithUIModel.uiModel(),
                  this.#showcaseStory.markupWithUIModel.uiModelType,
                  this.#showcaseStory.markupWithUIModel.render()
                )
              : defineControlMarkupWithoutUIModel(
                  this.#showcaseStory.markupWithoutUIModel
                    ? this.#showcaseStory.markupWithoutUIModel()
                    : "To be defined"
                )
          }
        ></ch-code>
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
  #copyButtonRef: HTMLButtonElement;
  #flexibleLayoutRef: HTMLChFlexibleLayoutRenderElement | undefined;
  #playgroundRef: HTMLChFlexibleLayoutRenderElement | undefined;
  #iframeRef: HTMLIFrameElement | undefined;

  @Element() el!: HTMLChShowcaseElement;

  /**
   * Specifies the name of the control.
   */
  @State() componentMetadata: NavigationListItemModel | undefined;
  @Watch("componentMetadata")
  componentMetadataChange(
    newComponentMetadata: NavigationListItemModel | undefined
  ) {
    const showcaseStory = this.#showcaseStory || this.#showcaseCustomStory;
    this.#storyFirstRender = true;

    // Story disconnectedCallback
    if (showcaseStory && showcaseStory.disconnectedCallback) {
      showcaseStory.disconnectedCallback();
    }

    this.#checkShowcaseStoryMapping(
      newComponentMetadata?.link!.url.replace("#", "")
    );
  }

  /**
   * Specifies the theme used in the iframe of the control
   */
  @Prop({ mutable: true }) colorScheme: "light" | "dark";
  @Watch("colorScheme")
  colorSchemeChange(newColorSchemeValue: "light" | "dark") {
    // The showcase does not render a iframe
    if (this.#showcaseStory) {
      return;
    }

    this.#iframeRef?.contentWindow.postMessage(
      newColorSchemeValue,
      `${
        window.location.origin
      }/showcase/pages/${this.componentMetadata.link!.url.replace(
        "#",
        ""
      )}.html`
    );
  }

  /**
   * Specifies the design system used in the iframe of the control
   */
  @Prop({ mutable: true }) designSystem: "mercury" | "unanimo";
  @Watch("designSystem")
  designSystemChange(newDSValue: "mercury" | "unanimo") {
    // The showcase does not render a iframe
    if (this.#showcaseStory) {
      return;
    }

    this.#iframeRef?.contentWindow.postMessage(
      newDSValue,
      `${
        window.location.origin
      }/showcase/pages/${this.componentMetadata.link!.url.replace(
        "#",
        ""
      )}.html`
    );
  }

  /**
   * Specifies the language direction of the document
   */
  @Prop({ mutable: true }) languageDirection: "ltr" | "rtl";

  /**
   * Specifies the version of the showcase displayed in the header
   */
  @Prop() readonly packageVersion: string;

  /**
   * Specifies the pages that will be displayed in the sidebar
   */
  @Prop({ mutable: true }) pages: NavigationListModel | undefined;

  /**
   * Specifies the stories for the showcase.
   */
  @Prop({ mutable: true }) stories!:
    | {
        custom: { [key: string]: ShowcaseCustomStory };
        landing: ShowcaseCustomStory;
        playground: ShowcaseStories;
      }
    | undefined;

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

  @Listen("hashchange", { target: "window" })
  onHashChange() {
    if (!window.location.hash) {
      this.componentMetadata = undefined;
      return;
    }

    const newComponentMetadata = findComponentMetadataUsingURLHash(
      this.pages,
      window.location.hash
    );

    if (newComponentMetadata) {
      this.componentMetadata = newComponentMetadata;
    }
  }

  #checkShowcaseStoryMapping = (componentId: string | undefined) => {
    // Free the memory
    this.#showcaseStoryCheckboxes = undefined;
    this.#showcaseStoryComboBoxes = undefined;
    this.#showcaseStoryInput = undefined;
    this.#showcaseStoryInputNumber = undefined;
    this.#showcaseStoryRadioGroups = undefined;

    this.#showcaseStory = this.stories.playground[componentId] ?? undefined;
    this.#showcaseCustomStory = this.stories.custom[componentId] ?? undefined;

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

  #initializePropertyInState = <T extends ShowcaseStoryClass>(
    property: ShowcaseRenderProperty<T>,
    object?:
      | ShowcaseRenderPropertyObject<T, keyof T>
      | ShowcaseRenderPropertyStyle
  ) => {
    if (property.type === "object") {
      // Initialize the object
      this.#handlerInitializationMapping[property.type](property as any);

      // Initialize all object properties. "property" in this case is the "object"
      property.properties.forEach(childProperty =>
        this.#initializePropertyInState(childProperty as any, property)
      );
    } else if (property.type === "style") {
      // Initialize the object
      this.#handlerInitializationMapping[property.type](property as any);

      // Initialize all object properties. "property" in this case is the "style"
      property.properties.forEach(childProperty =>
        this.#initializePropertyInState(childProperty, property)
      );
    } else {
      // TODO: Improve type inference
      this.#handlerInitializationMapping[property.type](
        property as any,
        object as any
      );
    }
  };

  #propertyGroupRender = (
    group: ShowcaseRenderPropertyGroup<ShowcaseStoryClass>,
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
      ShowcaseStoryClass,
      keyof ShowcaseStoryClass
    >
  ) =>
    properties.map(property =>
      this.#propertyRender[
        property.render ?? defaultRenderForEachPropertyType[property.type]
      ](property, object)
    );

  #propertyRenderWithLabel = (
    property: ShowcaseRenderProperty<ShowcaseStoryClass>,
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >
    ) => {
      const propertyGroupId = this.#getPropertyId(property, parentObject);

      return this.#propertyRenderWithLabel(property, [
        property.caption && (
          <label class="form-input__label" htmlFor={propertyGroupId}>
            {property.caption}
          </label>
        ),
        <ch-combo-box-render
          id={propertyGroupId}
          accessibleName={property.accessibleName}
          class="combo-box"
          model={this.#showcaseStoryComboBoxes.get(propertyGroupId).model}
          value={property.value.toString()}
          onInput={this.#showcaseStoryComboBoxes.get(propertyGroupId).handler}
        ></ch-combo-box-render>
      ]);
    },

    input: (
      property: ShowcaseRenderPropertyString<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >
    ) => this.#renderProperties(property.properties, property),

    "radio-group": (
      property: ShowcaseRenderPropertyEnum<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
      >,
      parentObject?: ShowcaseRenderPropertyObject<
        ShowcaseStoryClass,
        keyof ShowcaseStoryClass
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

  #handleCopyMarkup = (event: MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(
      (this.#copyButtonRef.nextElementSibling as HTMLChCodeElement).value
    );
  };

  #handleDesignSystemChange = () => {
    const newDS = getDesignSystem() === "unanimo" ? "mercury" : "unanimo";
    storeDesignSystem(newDS);
    setDesignSystemInBrowser(newDS);

    this.designSystem = newDS;
  };

  #handleColorSchemeChange = () => {
    const colorScheme = getTheme() === "light" ? "dark" : "light";
    storeTheme(colorScheme);
    setThemeInBrowser(colorScheme);

    this.colorScheme = colorScheme;
  };

  #handleLanguageDirectionChange = () => {
    const newLanguageDirection =
      getLanguageDirection() === "rtl" ? "ltr" : "rtl";

    storeLanguageDirection(newLanguageDirection);
    setLanguageDirectionInBrowser(newLanguageDirection);

    this.languageDirection = newLanguageDirection;
  };

  // #iframeRender = () => (
  //   <iframe
  //     src={"/showcase/pages/" + this.componentMetadata.id + ".html"}
  //     frameborder="0"
  //     ref={el => (this.#iframeRef = el)}
  //   ></iframe>
  // );

  #renderMainSection = () => {
    if (this.#showcaseStory) {
      return (
        <div class="ch-showcase__playground">
          <h1 class="heading-1">
            {this.componentMetadata.caption} ({this.componentMetadata.metadata})
          </h1>

          <ch-flexible-layout-render
            class="ch-showcase__flexible-layout-playground"
            model={flexibleLayoutPlaygroundConfiguration}
            renders={this.#flexibleLayoutPlaygroundRenders}
            ref={el => (this.#playgroundRef = el)}
          ></ch-flexible-layout-render>
        </div>
      );
    }

    if (this.#showcaseCustomStory) {
      return (
        <div class="ch-showcase__playground">
          <h1 class="heading-1">
            {this.componentMetadata.caption} ({this.componentMetadata.metadata})
          </h1>
          {this.#showcaseCustomStory.render()}
        </div>
      );
    }

    return this.stories?.landing.render();
  };

  async connectedCallback() {
    this.colorScheme ||= getTheme();
    this.designSystem ||= getDesignSystem();
    this.languageDirection ||= getLanguageDirection();

    if (!this.pages || !this.stories) {
      const [pagesBundle, storiesBundle, landingBundle] = await Promise.all([
        import("./pages"),
        import("./showcase-stories"),
        import("./landing")
      ]);

      this.pages = pagesBundle.showcasePages;

      this.stories = {
        // TODO: Improve type safety
        playground: storiesBundle.showcaseStories as any,
        custom: storiesBundle.showcaseCustomStories,
        landing: landingBundle.landingStory
      };
    }
    // Set initial page using the URL
    this.onHashChange();

    if (this.componentMetadata) {
      this.#checkShowcaseStoryMapping(
        this.componentMetadata?.link!.url.replace("#", "")
      );
    }
  }

  componentDidRender() {
    if (this.#flexibleLayoutRef) {
      forceUpdate(this.#flexibleLayoutRef);
    }

    // Wait until all references have been updated for the first-level flexible-layout component
    requestAnimationFrame(() => {
      const showcaseStory = this.#showcaseStory || this.#showcaseCustomStory;

      // This is a WA to make reactive the URL changes in the page
      // To remove this WA we must implement slots in the flexible-layout-render,
      // but to implement slots we should also implement Shadow DOM
      if (this.#playgroundRef) {
        forceUpdate(this.#playgroundRef);
      }

      if (this.#storyFirstRender) {
        this.#storyFirstRender = false;

        requestAnimationFrame(() => {
          // Story did load
          if (showcaseStory?.storyDidLoad) {
            showcaseStory.storyDidLoad();
          }

          // Story did render
          if (showcaseStory?.storyDidRender) {
            showcaseStory.storyDidRender();
          }
        });
      }
      // Story did render
      else if (showcaseStory?.storyDidRender) {
        showcaseStory.storyDidRender();
      }
    });
  }

  render() {
    return (
      <Host>
        <ch-flexible-layout-render
          // TODO: Fix error when adding the closeButton and closing the last item
          model={flexibleLayoutConfiguration}
          renders={this.#flexibleLayoutRender}
          ref={el => (this.#flexibleLayoutRef = el)}
        ></ch-flexible-layout-render>
      </Host>
    );
  }
}
