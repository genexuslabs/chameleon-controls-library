import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { createStateStore, type StateStore } from "@json-render/core";

import { IS_SERVER } from "../../development-flags";
import { playgroundEditorModels } from "./models";
import { renderPropertiesFromStore } from "./internal/form-editor/store-based";
import type { PlaygroundJsonRenderModel } from "./typings/playground-json-render-model";

// Side-effect to define the json-render element
import "../json-render/json-render.lit";

import styles from "./playground-editor.scss?inline";

@Component({
  tag: "ch-playground-editor",
  styles
})
export class ChPlaygroundEditor extends KasstorElement {
  #jsonRenderStore: StateStore = createStateStore();
  #unsubscribeStore: (() => void) | undefined;

  /**
   * Explicit model for the playground. Takes priority over `componentName`.
   */
  @property({ attribute: false }) componentModel:
    | PlaygroundJsonRenderModel
    | undefined;

  /**
   * Chameleon component tag name (e.g. "ch-checkbox"). Used to look up the
   * model from `playgroundEditorModels` when `componentModel` is not set.
   */
  @property() componentName: string | undefined;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                     Store management
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  @Observe(["componentModel", "componentName"])
  protected modelChanged(): void {
    this.#unsubscribeStore?.();
    const model = this.#getComponentModel();
    this.#jsonRenderStore = createStateStore(model?.spec.state ?? {});
    this.#unsubscribeStore = this.#jsonRenderStore.subscribe(() =>
      this.requestUpdate()
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribeStore?.();
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                      Public API
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Returns a snapshot of the current state from the internal StateStore.
   * Used by showcase-playground when transitioning to code editor mode.
   */
  get currentStateSnapshot(): Record<string, unknown> {
    return this.#jsonRenderStore.getSnapshot();
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                       Helpers
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  #getComponentModel = (): PlaygroundJsonRenderModel | undefined => {
    if (!this.componentModel && !this.componentName) {
      return undefined;
    }
    return (
      this.componentModel ??
      playgroundEditorModels[
        this.componentName as keyof typeof playgroundEditorModels
      ]
    );
  };

  #renderTheme = (model: PlaygroundJsonRenderModel) =>
    IS_SERVER
      ? html`<style>
          :host,
          html {
            visibility: hidden !important;
          }
        </style>`
      : html`<ch-theme .model=${model.bundles}></ch-theme>`;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //                        Render
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  override render() {
    const model = this.#getComponentModel();

    if (!model) {
      return nothing;
    }

    return html`${model.bundles ? this.#renderTheme(model) : nothing}
      <ch-json-render
        .spec=${model.spec}
        .registry=${model.registry}
        .store=${this.#jsonRenderStore}
        .functions=${model.functions ?? {}}
      ></ch-json-render>
      ${renderPropertiesFromStore(this.#jsonRenderStore, model.stateTypes)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-playground-editor": ChPlaygroundEditor;
  }
}


// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChPlaygroundEditorElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChPlaygroundEditorElement;
  }

  // prettier-ignore
  interface HTMLChPlaygroundEditorElement extends ChPlaygroundEditor {
    // Extend the ChPlaygroundEditor class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-playground-editor": HTMLChPlaygroundEditorElement;
  }

  interface HTMLElementTagNameMap {
    "ch-playground-editor": HTMLChPlaygroundEditorElement;
  }
}

