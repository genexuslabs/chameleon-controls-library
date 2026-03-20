import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { watch } from "@genexus/kasstor-signals/directives/watch.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import type { ComponentRenderModel } from "../../src/components/playground-editor/typings/component-render";
import { playgroundEditorModels } from "../../src/components/playground-editor/models";

// Import playground-editor (Mode 1)
import "../../src/components/playground-editor/playground-editor.lit";

// Import code editor (Mode 2)
import "./playground-code-editor.lit";
import type { CodeTab } from "./playground-code-editor.lit";

// Utilities
import {
  generateCode,
  toLitComplete,
  type Framework
} from "../core/dsl-to-framework";
import {
  readStateFromHash,
  writeStateToHash,
  type PlaygroundState
} from "../core/url-state";

import { codeTheme } from "../core/code-theme-signal";

import styles from "./playground.scss?inline";

type Mode = 1 | 2;

@Component({
  styles,
  tag: "showcase-playground"
})
export class ShowcasePlayground extends KasstorElement {
  /**
   * The Chameleon component tag name (e.g. "ch-checkbox"). If omitted, the
   * playground loads whatever is encoded in the URL hash.
   */
  @property({ attribute: "component-name" }) componentName: string | undefined;

  /**
   * An explicit ComponentRenderModel to use for Mode 1. Overrides the
   * built-in playgroundEditorModels lookup.
   */
  @property({ attribute: false }) componentModel:
    | ComponentRenderModel
    | undefined;

  // - - - Internal state - - -

  #mode: Mode = 1;
  #codeFramework: Framework = "Lit";
  #mode2Tabs: CodeTab[] = [];

  /** Pending hash write debounce timer. */
  #hashTimer: ReturnType<typeof setTimeout> | null = null;

  // - - - Lifecycle - - -

  override async connectedCallback() {
    super.connectedCallback();
    await this.#restoreFromHash();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#hashTimer !== null) clearTimeout(this.#hashTimer);
  }

  // - - - URL state - - -

  async #restoreFromHash() {
    const saved = await readStateFromHash();
    if (!saved) return;
    this.#mode = saved.mode;
    if (saved.mode === 2 && saved.tabs) {
      this.#mode2Tabs = saved.tabs.map((t, i) => ({
        id: `tab-${i}`,
        name: t.name,
        code: t.code
      }));
    } else if (saved.componentName) {
      this.componentName = saved.componentName;
    }
    this.requestUpdate();
  }

  #scheduleHashUpdate() {
    if (this.#hashTimer !== null) clearTimeout(this.#hashTimer);
    this.#hashTimer = setTimeout(() => {
      this.#writeHash();
    }, 1000);
  }

  #writeHash() {
    const state: PlaygroundState =
      this.#mode === 2
        ? {
            mode: 2,
            componentName: this.componentName,
            tabs: this.#mode2Tabs.map(t => ({ name: t.name, code: t.code }))
          }
        : {
            mode: 1,
            componentName: this.componentName
          };
    writeStateToHash(state);
  }

  // - - - Model helpers - - -

  #getModel(): ComponentRenderModel | undefined {
    if (this.componentModel) return this.componentModel;
    if (!this.componentName) return undefined;
    return playgroundEditorModels[
      this.componentName as keyof typeof playgroundEditorModels
    ];
  }

  // - - - Mode 1 helpers - - -

  #handleCodeFramework = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    this.#codeFramework = select.value as Framework;
    this.requestUpdate();
  };

  #getGeneratedCode(): string {
    const model = this.#getModel();
    if (!model) return "";
    return generateCode(model, this.#codeFramework, "complete");
  }

  // - - - Mode 1 → 2 transition - - -

  #handleEditCode = () => {
    const dialog = this.shadowRoot?.querySelector(
      ".transition-dialog"
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  };

  #handleTransitionConfirm = () => {
    const dialog = this.shadowRoot?.querySelector(
      ".transition-dialog"
    ) as HTMLDialogElement | null;
    dialog?.close();
    this.#transitionToMode2();
  };

  #handleTransitionCancel = () => {
    const dialog = this.shadowRoot?.querySelector(
      ".transition-dialog"
    ) as HTMLDialogElement | null;
    dialog?.close();
  };

  #transitionToMode2() {
    const model = this.#getModel();
    const tabs: CodeTab[] = [];
    const id0 = "tab-0";

    if (model) {
      tabs.push({
        id: id0,
        name: "main.ts",
        code: toLitComplete(model)
      });
      if (model.customCss) {
        tabs.push({ id: "tab-1", name: "styles.css", code: model.customCss });
      }
    } else {
      tabs.push({
        id: id0,
        name: "main.ts",
        code: `import { LitElement, html } from 'lit';\nimport { customElement } from 'lit/decorators.js';\n\n@customElement('my-app')\nexport class MyApp extends LitElement {\n  override render() {\n    return html\`<p>Hello from Chameleon!</p>\`;\n  }\n}\n\ndocument.body.append(document.createElement('my-app'));\n`
      });
    }

    this.#mode2Tabs = tabs;
    this.#mode = 2;
    this.#scheduleHashUpdate();
    this.requestUpdate();
  }

  // - - - Mode 2 handlers - - -

  #handleCodeChange = (event: CustomEvent<CodeTab[]>) => {
    this.#mode2Tabs = event.detail;
    this.#scheduleHashUpdate();
  };

  // - - - Share - - -

  #handleShare = async () => {
    await this.#writeHash();
    await navigator.clipboard.writeText(window.location.href).catch(() => {
      // Fallback: user can copy manually
    });
    // Brief visual feedback via button text (re-renders in 2s)
    const btn = this.shadowRoot?.querySelector(
      ".share-btn"
    ) as HTMLButtonElement | null;
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "✓ Copied!";
      setTimeout(() => {
        btn.textContent = orig;
      }, 2000);
    }
  };

  // - - - Rendering - - -

  #renderMode1() {
    const model = this.#getModel();
    const generatedCode = this.#getGeneratedCode();

    return html`
      <div class="mode1-layout" part="mode1-layout">
        <div class="editor-section" part="editor-section">
          <ch-playground-editor
            component-name=${this.componentName ?? ""}
            .componentModel=${model}
          ></ch-playground-editor>
        </div>

        <div class="code-preview-section" part="code-preview-section">
          <div class="code-preview-toolbar">
            <span class="code-preview-label">Generated Code</span>
            <select
              class="framework-select"
              @change=${this.#handleCodeFramework}
              .value=${this.#codeFramework}
            >
              <option value="Lit">Lit</option>
              <option value="React">React</option>
              <option value="Angular">Angular</option>
            </select>
          </div>
          <ch-code
            class="generated-code"
            language="typescript"
            theme=${watch(codeTheme)}
            .value=${generatedCode}
          ></ch-code>
        </div>

        <div class="mode1-actions" part="mode1-actions">
          <button class="share-btn action-btn" @click=${this.#handleShare}>
            ⬡ Share
          </button>
          <button
            class="edit-code-btn action-btn action-btn--primary"
            @click=${this.#handleEditCode}
          >
            &lt;/&gt; Edit Code
          </button>
        </div>
      </div>

      <!-- Transition confirmation dialog -->
      <dialog class="transition-dialog" part="transition-dialog">
        <h3>Switch to code editor?</h3>
        <p>
          Switching to the code editor is one-way for this session. Your current
          property editor state will be converted to Lit code.
        </p>
        <div class="dialog-actions">
          <button
            class="dialog-btn dialog-btn--secondary"
            @click=${this.#handleTransitionCancel}
          >
            Cancel
          </button>
          <button
            class="dialog-btn dialog-btn--primary"
            @click=${this.#handleTransitionConfirm}
          >
            Continue
          </button>
        </div>
      </dialog>
    `;
  }

  #renderMode2() {
    return html`
      <div class="mode2-layout" part="mode2-layout">
        <div class="mode2-toolbar" part="mode2-toolbar">
          <span class="mode-badge">Code Editor</span>
          <button class="share-btn action-btn" @click=${this.#handleShare}>
            ⬡ Share
          </button>
        </div>
        <showcase-playground-code-editor
          class="code-editor"
          .initialTabs=${this.#mode2Tabs}
          @codeChange=${this.#handleCodeChange}
        ></showcase-playground-code-editor>
      </div>
    `;
  }

  override render() {
    return html`
      ${this.#mode === 1 ? this.#renderMode1() : nothing}
      ${this.#mode === 2 ? this.#renderMode2() : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-playground": ShowcasePlayground;
  }
}
