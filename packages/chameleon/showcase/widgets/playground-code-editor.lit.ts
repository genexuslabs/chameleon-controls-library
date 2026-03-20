import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { watch } from "@genexus/kasstor-signals/directives/watch.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import "../../src/components/code/code.lit";
import "../../src/components/layout-splitter/layout-splitter.lit";
import type { LayoutSplitterModel } from "../../src/components/layout-splitter/types";
import "./native-tabs.lit";
import type { NativeTab } from "./native-tabs.lit";

import { codeTheme } from "../core/code-theme-signal";
import { buildImportMapScript } from "../core/import-map";

import styles from "./playground-code-editor.scss?inline";

export type CodeTab = {
  id: string;
  name: string;
  code: string;
};

let tabIdCounter = 0;
function newTabId() {
  return `tab-${++tabIdCounter}`;
}

const SPLIT_MODEL: LayoutSplitterModel = [
  { id: "editor", size: "1fr", minSize: "200px" },
  { id: "preview", size: "1fr", minSize: "200px" }
];

@Component({
  styles,
  tag: "showcase-playground-code-editor"
})
export class ShowcasePlaygroundCodeEditor extends KasstorElement {
  /** Initial tabs. If empty, one blank tab is created. */
  @property({ attribute: false }) initialTabs: CodeTab[] = [];

  /** Emitted whenever the tab contents change (so the parent can persist state). */
  @Event() protected codeChange!: EventEmitter<CodeTab[]>;

  #tabs: CodeTab[] = [];
  #activeTabId: string = "";
  #previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  override connectedCallback() {
    super.connectedCallback();

    if (this.initialTabs.length > 0) {
      this.#tabs = this.initialTabs.map(t => ({ ...t }));
    } else {
      const id = newTabId();
      this.#tabs = [
        {
          id,
          name: "main.ts",
          code: `import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import 'chameleon/checkbox';

@customElement('my-app')
export class MyApp extends LitElement {
  override render() {
    return html\`<ch-checkbox caption="Hello Chameleon"></ch-checkbox>\`;
  }
}

document.body.append(document.createElement('my-app'));
`
        }
      ];
    }
    this.#activeTabId = this.#tabs[0].id;
    this.#schedulePreviewRebuild();
  }

  // - - - - - Tab management - - - - -

  #getActiveTab(): CodeTab | undefined {
    return this.#tabs.find(t => t.id === this.#activeTabId);
  }

  #handleTabSelect = (event: CustomEvent<string>) => {
    this.#activeTabId = event.detail;
    this.requestUpdate();
  };

  #handleTabClose = (event: CustomEvent<string>) => {
    const id = event.detail;
    if (this.#tabs.length <= 1) return; // Minimum 1 tab
    const idx = this.#tabs.findIndex(t => t.id === id);
    this.#tabs = this.#tabs.filter(t => t.id !== id);
    // Move active tab if needed
    if (this.#activeTabId === id) {
      this.#activeTabId =
        this.#tabs[Math.max(0, idx - 1)]?.id ?? this.#tabs[0].id;
    }
    this.#schedulePreviewRebuild();
    this.requestUpdate();
  };

  #handleTabAdd = () => {
    const id = newTabId();
    const name = `file${this.#tabs.length + 1}.ts`;
    this.#tabs = [...this.#tabs, { id, name, code: "" }];
    this.#activeTabId = id;
    this.requestUpdate();
  };

  // - - - - - Code editing - - - - -

  #handleCodeInput = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const active = this.#getActiveTab();
    if (!active) return;
    active.code = textarea.value;
    this.requestUpdate();
    this.#schedulePreviewRebuild();
    this.codeChange.emit([...this.#tabs]);
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    const textarea = event.target as HTMLTextAreaElement;

    if (event.key === "Tab") {
      event.preventDefault();
      const { selectionStart, selectionEnd, value } = textarea;
      textarea.value =
        value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
      const newPos = selectionStart + 2;
      textarea.setSelectionRange(newPos, newPos);
      const active = this.#getActiveTab();
      if (active) active.code = textarea.value;
      this.requestUpdate();
      this.#schedulePreviewRebuild();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const { selectionStart, value } = textarea;
      // Match leading whitespace of current line for auto-indent
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart, selectionStart);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? "";
      const insertion = "\n" + indent;
      textarea.value =
        value.slice(0, selectionStart) +
        insertion +
        value.slice(selectionStart);
      const newPos = selectionStart + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
      const active = this.#getActiveTab();
      if (active) active.code = textarea.value;
      this.requestUpdate();
      this.#schedulePreviewRebuild();
    }
  };

  // - - - - - Scroll sync - - - - -

  #handleScroll = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const host = this.shadowRoot?.querySelector(".editor-scroll-container");
    if (!host) return;
    const codeEl = host.querySelector("ch-code");
    if (codeEl) {
      (codeEl as HTMLElement).scrollTop = textarea.scrollTop;
      (codeEl as HTMLElement).scrollLeft = textarea.scrollLeft;
    }
  };

  // - - - - - Download - - - - -

  #handleDownload = () => {
    const active = this.#getActiveTab();
    if (!active) return;
    const blob = new Blob([active.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = active.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // - - - - - Preview - - - - -

  #schedulePreviewRebuild() {
    if (this.#previewDebounceTimer !== null) {
      clearTimeout(this.#previewDebounceTimer);
    }
    this.#previewDebounceTimer = setTimeout(() => {
      this.#rebuildPreview();
    }, 500);
  }

  #rebuildPreview() {
    const iframe = this.shadowRoot?.querySelector(
      ".preview-iframe"
    ) as HTMLIFrameElement | null;
    if (!iframe) return;

    // Build blob URL entries for secondary tabs (non-main files)
    const [mainTab, ...secondaryTabs] = this.#tabs;
    const extraEntries: Record<string, string> = {};

    // Revoke previous blob URLs to avoid leaks
    for (const url of Object.values(this.#blobUrls)) {
      URL.revokeObjectURL(url);
    }
    this.#blobUrls = {};

    for (const tab of secondaryTabs) {
      const blob = new Blob([tab.code], { type: "text/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      extraEntries[`./${tab.name}`] = blobUrl;
      this.#blobUrls[tab.name] = blobUrl;
    }

    const importMapJson = buildImportMapScript(extraEntries);
    const mainCode = mainTab?.code ?? "";

    iframe.srcdoc = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    html, body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: #fff; }
  </style>
  <script type="importmap">
${importMapJson}
  </script>
</head>
<body>
  <script type="module">
${mainCode}
  </script>
</body>
</html>`;
  }

  /** Tracks blob URLs so they can be revoked on next rebuild. */
  #blobUrls: Record<string, string> = {};

  override disconnectedCallback() {
    super.disconnectedCallback();
    for (const url of Object.values(this.#blobUrls)) {
      URL.revokeObjectURL(url);
    }
    if (this.#previewDebounceTimer !== null) {
      clearTimeout(this.#previewDebounceTimer);
    }
  }

  override render() {
    const activeTab = this.#getActiveTab();
    const nativeTabs: NativeTab[] = this.#tabs.map(t => ({
      id: t.id,
      name: t.name
    }));

    return html`
      <div class="editor-panel" part="editor-panel">
        <div class="editor-toolbar" part="editor-toolbar">
          <showcase-native-tabs
            .tabs=${nativeTabs}
            active-tab=${this.#activeTabId}
            @tabSelect=${this.#handleTabSelect}
            @tabClose=${this.#handleTabClose}
            @tabAdd=${this.#handleTabAdd}
          ></showcase-native-tabs>

          <div class="toolbar-actions">
            <button
              class="toolbar-btn"
              title="Download current file"
              @click=${this.#handleDownload}
            >
              ⬇ Download
            </button>
          </div>
        </div>

        <div class="editor-scroll-container" part="editor-scroll-container">
          <ch-code
            class="code-highlight"
            language="typescript"
            theme=${watch(codeTheme)}
            .value=${activeTab?.code ?? ""}
          ></ch-code>
          <textarea
            class="code-textarea"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            .value=${activeTab?.code ?? ""}
            @input=${this.#handleCodeInput}
            @keydown=${this.#handleKeyDown}
            @scroll=${this.#handleScroll}
          ></textarea>
        </div>

        <details class="import-info" part="import-info">
          <summary>Supported imports</summary>
          <ul>
            <li><code>lit</code>, <code>lit/decorators.js</code>, <code>lit/directives/*</code></li>
            <li><code>chameleon/checkbox</code>, <code>chameleon/switch</code>, <code>chameleon/slider</code>, <code>chameleon/edit</code>, …</li>
            <li><code>./filename.ts</code> — other open tabs</li>
          </ul>
        </details>
      </div>

      <iframe
        class="preview-iframe"
        part="preview-iframe"
        sandbox="allow-scripts"
        title="Preview"
      ></iframe>
    `;
  }

  override updated() {
    // After Lit re-renders, ensure the textarea value is in sync (Lit doesn't
    // re-set .value if the user changed it; we need to force it on tab switch).
    const textarea = this.shadowRoot?.querySelector(
      ".code-textarea"
    ) as HTMLTextAreaElement | null;
    const activeTab = this.#getActiveTab();
    if (textarea && activeTab && textarea.value !== activeTab.code) {
      textarea.value = activeTab.code;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-playground-code-editor": ShowcasePlaygroundCodeEditor;
  }
}
