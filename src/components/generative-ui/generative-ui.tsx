import { Component, Element, Host, Prop, State, h } from "@stencil/core";
import { GenerativeUIModel, GenerativeUISample } from "./internal/types";
import { TabModel, TabSelectedItemInfo } from "../tab/types";
import { renderLoading } from "./internal/loading";
import { ChTabRenderCustomEvent, LayoutSplitterModel } from "../../components";
import { performUIGeneration } from "./internal/perform-ui-generation";

const ENTER_KEY = "Enter";

const SAMPLES_ID = "samples";
const PLAYGROUND_ID = "playground";
const CODE_HTML_ID = "code";

const TAB_MODEL_PLAYGROUND: TabModel = [{ id: SAMPLES_ID, name: "Samples" }];

const TAB_MODEL_PLAYGROUND_AND_CODE: TabModel = [
  { id: SAMPLES_ID, name: "Samples" },
  { id: PLAYGROUND_ID, name: "Playground" },
  { id: CODE_HTML_ID, name: "HTML code" }
];

const layout: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "aside",
      size: "150px",
      minSize: "50px"
    },
    {
      id: "main",
      size: "1fr",
      minSize: "300px"
    }
  ]
};

/**
 * A control to generate web UI based on Chameleon.
 */
@Component({
  shadow: false,
  styleUrl: "generative-ui.scss",
  tag: "ch-generative-ui"
})
export class ChGenerativeUI {
  #tabModel = TAB_MODEL_PLAYGROUND;
  #htmlCode: string;

  // Refs
  #editRef!: HTMLChEditElement;
  #renderRef!: HTMLDivElement;

  @Element() el: HTMLChGenerativeUiElement;

  @State() generatingUI = false;
  @State() selectedTabId = SAMPLES_ID;

  /**
   * Specifies the messages of the control used to generate the UI.
   */
  @Prop() readonly model: GenerativeUIModel;

  /**
   * Specifies the initial samples of the control that are used to prompt
   * predefined cases.
   */
  @Prop() readonly samples: GenerativeUISample[] = [];

  /**
   * Specifies a callback to update the UI models of the generated UI. This
   * callback is useful to provide default models when generating the UI.
   */
  @Prop() readonly updateModelsCallback: (renderRef: HTMLElement) => void;

  #handleUIGenerationWithKeyboard = (event: KeyboardEvent) => {
    if (event.key !== ENTER_KEY || event.shiftKey) {
      return;
    }
    event.preventDefault();

    this.#performUIGeneration();
  };

  #handleUIGeneration = (event: MouseEvent) => {
    event.stopPropagation();
    this.#performUIGeneration();
  };

  #clearAndFocusInput = () => {
    // Clear the input
    this.#editRef.value = "";
    this.#editRef.click();
  };

  #performUIGeneration = (sample?: GenerativeUISample) => {
    if ((!sample && !this.#editRef.value) || this.generatingUI) {
      return;
    }

    this.generatingUI = true;

    performUIGeneration(this.#editRef.value, sample).then(html =>
      this.#updateUIGeneration(html, sample)
    );

    this.#clearAndFocusInput();
  };

  #updateUIGeneration = (html: string, sample?: GenerativeUISample) => {
    this.generatingUI = false;
    this.#htmlCode = html;
    this.#tabModel = TAB_MODEL_PLAYGROUND_AND_CODE;
    this.selectedTabId = PLAYGROUND_ID;

    // TODO: Sanitize HTML
    this.#renderRef.innerHTML = html;

    if (sample) {
      sample.initializeModels(this.#renderRef);
      return;
    }

    if (this.updateModelsCallback) {
      this.updateModelsCallback(this.#renderRef);
    }
  };

  #handleSelectedItemChange = (
    event: ChTabRenderCustomEvent<TabSelectedItemInfo>
  ) => {
    this.selectedTabId = event.detail.newSelectedId;
  };

  #handleSampleCreation = (sample: GenerativeUISample) => () => {
    this.#performUIGeneration(sample);
    this.#clearAndFocusInput();
  };

  render() {
    return (
      <Host>
        <ch-layout-splitter model={layout}>
          <aside
            slot="aside"
            aria-labelledby="generative-ui-projects"
            class="card generative-ui__aside"
          >
            <h2 id="generative-ui-projects heading-4">Generated projects</h2>

            <ch-action-list-render class="list-box-secondary"></ch-action-list-render>
          </aside>

          <section slot="main" class="generative-ui__main">
            <ch-tab-render
              class="tab"
              closeButtonHidden
              direction="block"
              selectedId={this.selectedTabId}
              model={this.#tabModel}
              onSelectedItemChange={this.#handleSelectedItemChange}
            >
              {this.selectedTabId === SAMPLES_ID && (
                <div
                  key={SAMPLES_ID}
                  slot={SAMPLES_ID}
                  // Improve accessibility by announcing live changes
                  aria-live="polite"
                  // Wait until all changes are made to prevents assistive
                  // technologies from announcing changes before updates are done
                  aria-busy={this.generatingUI ? "true" : "false"}
                  class="card generative-ui__tab"
                >
                  <article
                    aria-labelledby="generative-ui-samples"
                    class="generative-ui__samples"
                  >
                    <h2 id="generative-ui-samples" class="heading-3">
                      Samples
                    </h2>

                    <div class="generative-ui__samples-container">
                      {this.samples.map((sample, index) => (
                        <article
                          aria-labelledby={`generative-ui-sample--${index}`}
                        >
                          <button
                            type="button"
                            class="card icon-background generative-ui__sample"
                            style={{ "--icon-path": sample.imageSrc }}
                            onClick={this.#handleSampleCreation(sample)}
                          >
                            <h3 id={`generative-ui-sample--${index}`}>
                              {sample.caption}
                            </h3>
                          </button>
                        </article>
                      ))}
                    </div>
                  </article>
                </div>
              )}

              <div
                key={PLAYGROUND_ID}
                slot={PLAYGROUND_ID}
                // Improve accessibility by announcing live changes
                aria-live="polite"
                // Wait until all changes are made to prevents assistive
                // technologies from announcing changes before updates are done
                aria-busy={this.generatingUI ? "true" : "false"}
                class="card generative-ui__tab"
                ref={el => (this.#renderRef = el)}
              ></div>

              {this.#tabModel.length === 3 && (
                <div
                  key={CODE_HTML_ID}
                  slot={CODE_HTML_ID}
                  // Improve accessibility by announcing live changes
                  aria-live="polite"
                  // Wait until all changes are made to prevents assistive
                  // technologies from announcing changes before updates are done
                  aria-busy={this.generatingUI ? "true" : "false"}
                  class="card generative-ui__tab"
                >
                  <ch-code
                    class="code"
                    value={this.#htmlCode}
                    language="html"
                  ></ch-code>
                </div>
              )}

              {this.generatingUI && renderLoading(this.selectedTabId)}
            </ch-tab-render>

            <div
              key="input-container"
              class="card generative-ui__input-container"
            >
              <ch-edit
                accessibleName="Prompt"
                autoFocus
                class="form-textarea"
                multiline
                autoGrow
                placeholder="Send a message..."
                onKeyDown={this.#handleUIGenerationWithKeyboard}
                ref={el => (this.#editRef = el)}
              ></ch-edit>
              <button
                class="button-tertiary button-icon-only generative-ui__send-button"
                type="button"
                onClick={this.#handleUIGeneration}
              ></button>
            </div>
          </section>
        </ch-layout-splitter>
      </Host>
    );
  }
}
