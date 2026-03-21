import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import styles from "./native-tabs.scss?inline";

export type NativeTab = {
  id: string;
  name: string;
};

@Component({
  styles,
  tag: "showcase-native-tabs"
})
export class ShowcaseNativeTabs extends KasstorElement {
  /** The list of open tabs. */
  @property({ attribute: false }) tabs: NativeTab[] = [];

  /** The currently active tab ID. */
  @property({ attribute: "active-tab" }) activeTab: string | undefined;

  /** Emitted when the user selects a tab. */
  @Event() protected tabSelect!: EventEmitter<string>;

  /** Emitted when the user clicks the close button on a tab. */
  @Event() protected tabClose!: EventEmitter<string>;

  /** Emitted when the user clicks the "+" button to add a new tab. */
  @Event() protected tabAdd!: EventEmitter<void>;

  #handleTabClick = (id: string) => {
    if (id !== this.activeTab) {
      this.tabSelect.emit(id);
    }
  };

  #handleTabClose = (event: MouseEvent, id: string) => {
    // Prevent the click from also selecting the tab.
    event.stopPropagation();
    this.tabClose.emit(id);
  };

  #handleAddClick = () => {
    this.tabAdd.emit();
  };

  override render() {
    return html`
      <div class="tab-bar" part="tab-bar" role="tablist">
        ${repeat(
          this.tabs,
          tab => tab.id,
          tab => html`
            <div
              class="tab ${tab.id === this.activeTab ? "tab--active" : ""}"
              part="tab ${tab.id === this.activeTab ? "tab-active" : ""}"
              role="tab"
              tabindex="0"
              aria-selected=${tab.id === this.activeTab ? "true" : "false"}
              @click=${() => this.#handleTabClick(tab.id)}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this.#handleTabClick(tab.id);
                }
              }}
            >
              <span class="tab-name">${tab.name}</span>
              ${this.tabs.length > 1
                ? html`<button
                    class="tab-close"
                    part="tab-close"
                    aria-label="Close ${tab.name}"
                    title="Close ${tab.name}"
                    @click=${(e: MouseEvent) =>
                      this.#handleTabClose(e, tab.id)}
                  >
                    ×
                  </button>`
                : ""}
            </div>
          `
        )}

        <button
          class="tab-add"
          part="tab-add"
          aria-label="Add new tab"
          title="Add new tab"
          @click=${this.#handleAddClick}
        >
          +
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-native-tabs": ShowcaseNativeTabs;
  }
}
