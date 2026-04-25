import { Component, KasstorElement } from "@genexus/kasstor-core/decorators/component.js";
import { addStyleSheet, removeStyleSheet } from "@genexus/kasstor-webkit";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

import { Observe, renderByPlatform } from "@genexus/kasstor-core";
import { IS_SERVER } from "../../development-flags";
import styles from "./custom-render.scss?inline";

// Constructable-stylesheet cache keyed by the raw CSS string. Multiple
// ch-custom-render instances that share the same theme reuse a single
// CSSStyleSheet — they're cheap to share across shadow roots, and
// addStyleSheet/removeStyleSheet from kasstor-webkit are reference-counted, so
// concurrent instances don't double-add or prematurely remove the sheet.
const THEME_SHEETS = new Map<string, CSSStyleSheet>();

const getThemeSheet = (cssText: string): CSSStyleSheet => {
  let sheet = THEME_SHEETS.get(cssText);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    THEME_SHEETS.set(cssText, sheet);
  }
  return sheet;
};

@Component({
  styles,
  tag: "ch-custom-render"
})
export class ChCustomRender extends KasstorElement {
  /**
   * Content rendered inside this element's shadow root.
   */
  @property({ attribute: false }) content:
    | TemplateResult
    | undefined
    | null
    | typeof nothing
    | string;

  /**
   * Parts to be re-exported from this element.
   */
  @property({ attribute: "exportparts", reflect: true }) exportParts: string | undefined;

  /**
   * Theme CSS scoped to this element's shadow root. Two complementary
   * mechanisms apply it depending on the render mode:
   *
   * - **SSR**: the source string is shipped inside an inline `<style>` tag.
   *   `CSSStyleSheet` does not exist in Node, and the only way to get styles
   *   into the server-rendered HTML is for them to be part of the serialized
   *   markup. {@link renderByPlatform} guarantees this branch is the one
   *   emitted on the server.
   *
   * - **Client hydration**: the SSR-emitted `<style>` is kept in the DOM
   *   until {@link renderByPlatform}'s post-hydration microtask swaps it for
   *   `nothing`, removing the inline tag without a hydration mismatch. By
   *   that point `connectedCallback` has already adopted the constructable
   *   stylesheet, so styling stays continuous.
   *
   * - **Runtime (browser)**: the same string is adopted as a `CSSStyleSheet`
   *   on the shadow root via `addStyleSheet`. Instances that share the same
   *   source string share the same `CSSStyleSheet` (deduped via
   *   {@link THEME_SHEETS}); reference-counted add/remove keeps the count
   *   accurate when several elements come and go.
   *
   * Supported transitions (resolved by {@link #syncAdoptedSheet}):
   *  - `undefined → "css"`: adopt the sheet.
   *  - `"a" → "b"`:        remove "a", adopt "b".
   *  - `"css" → undefined`: remove the sheet.
   *  - same value:          no-op.
   *
   * Adoption is also synchronized with the element's connection state. The
   * sheet is removed in `disconnectedCallback` and re-adopted in
   * `connectedCallback`, so a DOM move (which fires disconnect + connect
   * synchronously) leaves the refcount balanced — and a reconnection after
   * a theme change while detached re-adopts the new value, not the stale one.
   *
   * Adoption is a no-op on the server (`CSSStyleSheet` does not exist there).
   */
  @property({ attribute: false }) theme: string | undefined;

  /**
   * Theme string currently adopted onto the shadow root. The single source of
   * truth used by every adoption path (observer + lifecycle), so guards stay
   * simple and the observer cannot collide with `connectedCallback`.
   */
  #adoptedTheme: string | undefined;

  @Observe("theme")
  protected themeChanged(
    newTheme: string | undefined,
    _oldTheme: string | undefined
  ) {
    if (IS_SERVER) {
      return;
    }
    // The previous *property* value (`_oldTheme`) can drift from what is
    // actually adopted on the shadow root (e.g. after `disconnectedCallback`
    // already removed the previous sheet). `#syncAdoptedSheet` operates
    // against `#adoptedTheme`, the real source of truth.
    this.#syncAdoptedSheet(newTheme);
  }

  /**
   * Idempotently brings `shadowRoot.adoptedStyleSheets` in sync with `target`.
   * Compares against {@link #adoptedTheme} (not the property), so it is safe
   * to call from both the observer and the connect/disconnect lifecycle
   * without double-add or stale removal.
   */
  #syncAdoptedSheet(target: string | undefined) {
    const root = this.shadowRoot;
    if (!root || target === this.#adoptedTheme) {
      return;
    }

    if (this.#adoptedTheme) {
      removeStyleSheet(root, getThemeSheet(this.#adoptedTheme));
    }
    if (target) {
      addStyleSheet(root, getThemeSheet(target));
    }
    this.#adoptedTheme = target;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // First connect is covered by the @Observe callback (which fires on the
    // initial render whenever `theme` is not undefined — see Observe docs).
    // We only step in on real reconnections, distinguished by Lit's built-in
    // `hasUpdated`: it is `false` until the first update completes and stays
    // `true` afterwards, including across disconnect/reconnect cycles. DOM
    // moves (synchronous disconnect + connect) hit this branch and re-adopt
    // what disconnect removed.
    if (!IS_SERVER && this.hasUpdated) {
      this.#syncAdoptedSheet(this.theme);
    }
  }

  override disconnectedCallback(): void {
    // Symmetric cleanup: drop the sheet from `adoptedStyleSheets` so the
    // refcount stays balanced when the element is disposed (or moved). On
    // reconnect, `connectedCallback` re-adopts whichever theme is current.
    if (!IS_SERVER) {
      this.#syncAdoptedSheet(undefined);
    }
    super.disconnectedCallback();
  }

  override render() {
    // The inline <style> branch is only relevant when the component is being
    // server-side rendered or hydrated. For pure client-only renders
    // `wasServerSideRendered` is `false`, so we skip the directive entirely
    // and rely solely on the adopted stylesheet.
    //
    // `renderByPlatform(browserValue, serverValue)`:
    //   - on the server: emits the <style> tag (carries the CSS in the HTML).
    //   - during hydration: keeps the SSR-emitted <style> until the post-
    //     hydration microtask swaps it for `nothing`, so the adopted
    //     stylesheet (already attached by `themeChanged`) becomes the
    //     single source of truth without a hydration mismatch.
    return this.theme && this.wasServerSideRendered
      ? html`${renderByPlatform(
          nothing,
          html`<style>
            ${this.theme}
          </style>`
        )}${this.content}`
      : this.content;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChCustomRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChCustomRenderElement;
  }

  // prettier-ignore
  interface HTMLChCustomRenderElement extends ChCustomRender {
    // Extend the ChCustomRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-custom-render": HTMLChCustomRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-custom-render": HTMLChCustomRenderElement;
  }
}

