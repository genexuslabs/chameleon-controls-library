import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import type { ThemeModel } from "../theme/theme-types";
import { renderProperties } from "./internal/form-editor";
import type {
  ComponentRenderModel,
  ComponentRenderTemplateItemNode
} from "./typings/component-render";

// Side-effect to define the component-render element
import "./internal/component-render/component-render.lit";

import { IS_SERVER } from "../../development-flags";
import { playgroundEditorModels } from "./models";
import styles from "./playground-editor.scss?inline";

@Component({
  tag: "ch-playground-editor",
  styles
})
export class ChPlaygroundEditor extends KasstorElement {
  #cssTheme: ThemeModel | undefined = [
    {
      name: "Mercury",
      url: "https://unpkg.com/@genexus/mercury@0.26.0/dist/bundles/css/all.css"
    }
  ];
  // #treeViewExplorerModel: TreeViewModel | undefined;

  /**
   *
   */
  @property({ attribute: false }) componentModel:
    | ComponentRenderModel
    | undefined;

  /**
   *
   */
  @property() componentName: string | undefined;

  /**
   *
   */
  @property({ attribute: false }) selectedItem:
    | ComponentRenderTemplateItemNode
    | undefined;

  // #updateSelectedElement = (
  //   event: CustomEvent<TreeViewItemModelExtended[]>
  // ) => {
  //   const selectedItems = event.detail;

  //   this.selectedElement =
  //     selectedItems.length === 0
  //       ? undefined
  //       : // We are storing the template item reference in the metadata of the ch-tree-view-item
  //         (selectedItems[0].item.metadata as ComponentTemplateItem);
  // };

  // protected override willUpdate(changedProperties: PropertyValues): void {
  //   if (changedProperties.has("codeSnippet")) {
  //     this.#treeViewExplorerModel = getTreeViewModelForCodeSnippet(
  //       this.codeSnippet
  //     );
  //   }
  // }

  #renderTheme = () =>
    IS_SERVER
      ? html`<style>
          :host,
          html {
            visibility: hidden !important;
          }
        </style>`
      : html`<ch-theme .model=${this.#cssTheme}></ch-theme>`;

  #initialSelectedItem = (): ComponentRenderTemplateItemNode | undefined => {
    const { template } = this.#getComponentModel() ?? {};

    if (!template) {
      return undefined;
    }
    const firstItem = Array.isArray(template) ? template[0] : template;

    return typeof firstItem === "string" ? undefined : firstItem;
  };

  #getComponentModel = () => {
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

  #updateRenderedProperties = () => this.requestUpdate();

  override render() {
    const selectedItem = this.#initialSelectedItem();
    const componentModel = this.#getComponentModel();

    if (!componentModel) {
      return nothing;
    }

    return html`${this.#cssTheme ? this.#renderTheme() : nothing}
      <ch-component-render
        .model=${componentModel}
        @modelUpdate=${this.#updateRenderedProperties}
      ></ch-component-render>
      ${selectedItem === undefined
        ? nothing
        : renderProperties(selectedItem, componentModel.states)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-playground-editor": ChPlaygroundEditor;
  }
}

//  <ch-tree-view-render
// class="tree-view"
// .model=${this.#treeViewExplorerModel}
// .showLines=${"last"}
// @selectedItemsChange=${this.#updateSelectedElement}
// ></ch-tree-view-render>


// ######### Auto generated bellow #########

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

