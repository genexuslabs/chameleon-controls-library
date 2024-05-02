import { Component, Prop, Host, Watch, h } from "@stencil/core";
import { ShowcaseAvailableStories, ShowcaseStory } from "./types";
import { showcaseStories } from "./showcase-stories";
import { FlexibleLayout, FlexibleLayoutRenders } from "../../../../components";

const MAIN_WIDGET = "main";
const CONFIGURATION_WIDGET = "configuration";

const flexibleLayoutConfiguration: FlexibleLayout = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: MAIN_WIDGET,
      size: "1fr",
      type: "single-content",
      widget: { id: MAIN_WIDGET, name: null }
    },
    {
      id: CONFIGURATION_WIDGET,
      size: "300px",
      minSize: "200px",
      type: "single-content",
      widget: { id: CONFIGURATION_WIDGET, name: null }
    }
  ]
};

@Component({
  shadow: false,
  styleUrl: "showcase.scss",
  tag: "ch-showcase"
})
export class ChShowcase {
  #showcaseStory: ShowcaseStory<ShowcaseAvailableStories> | undefined;
  #iframeRef: HTMLIFrameElement;

  #flexibleLayoutRender: FlexibleLayoutRenders = {
    [MAIN_WIDGET]: () => (
      <div key={MAIN_WIDGET} slot={MAIN_WIDGET}>
        {this.#showcaseStory.render()}
      </div>
    ),
    [CONFIGURATION_WIDGET]: () => (
      <div key={CONFIGURATION_WIDGET} slot={CONFIGURATION_WIDGET}></div>
    )
  };

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
    this.#showcaseStory = componentName
      ? showcaseStories.get(componentName as any)
      : undefined;

    if (this.#showcaseStory) {
      const properties = this.#showcaseStory.properties;
      const state = this.#showcaseStory.state;

      // Initialize state with default values
      properties.forEach(property => {
        state[property.id as any] = property.default;
      });
    }
  };

  #customShowcaseRender = () => (
    <ch-flexible-layout-render
      renders={this.#flexibleLayoutRender}
      layout={flexibleLayoutConfiguration}
    ></ch-flexible-layout-render>
  );

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

  render() {
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
