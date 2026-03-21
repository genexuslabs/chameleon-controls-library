import {
  Component,
  KasstorElement,
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing, type PropertyValues } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { property } from "lit/decorators/property.js";

import {
  createStateStore,
  evaluateVisibility,
  resolveElementProps,
  resolveBindings,
  type Spec,
  type UIElement,
  type StateStore,
  type StateModel,
  type ComputedFunction,
  type PropResolutionContext,
} from "@json-render/core";

import styles from "./json-render.scss?inline";
import { executeActionBinding } from "./actions.js";
import type {
  ComponentRenderer,
  ComponentRegistry,
  RepeatScope,
  EventHandle,
} from "./types.js";

@Component({ tag: "ch-json-render", styles, shadow: {} })
export class ChJsonRender extends KasstorElement {
  /** The JSON spec describing the UI tree to render. */
  @property({ attribute: false }) spec: Spec | null = null;

  /** Registry mapping element type names to renderer functions. */
  @property({ attribute: false }) registry: ComponentRegistry = {};

  /**
   * External state store (controlled mode).
   * When absent, an internal store seeded from `spec.state` is used.
   */
  @property({ attribute: false }) store: StateStore | undefined = undefined;

  /** Named functions available for `$computed` prop expressions. */
  @property({ attribute: false }) functions: Record<string, ComputedFunction> =
    {};

  /** When true, each renderer receives `loading: true` (e.g. during streaming). */
  @property({ type: Boolean }) loading = false;

  /**
   * Fallback renderer used when an element type is not in the registry.
   * Useful for showing a skeleton while the registry is being built.
   */
  @property({ attribute: false }) fallback: ComponentRenderer | undefined =
    undefined;

  /**
   * Optional CSS string adopted into the component's shadow root.
   * Use this to style elements rendered by the registry, which live inside
   * the shadow DOM and cannot be styled from outside.
   */
  @property({ attribute: false }) styleSheet: string = "";

  /**
   * Handler for custom (non-built-in) actions.
   * Receives the action name, resolved params, a setState helper, and a
   * getState snapshot function.
   */
  @property({ attribute: false }) onAction:
    | ((
        name: string,
        params?: Record<string, unknown>,
        setState?: (path: string, value: unknown) => void,
        getState?: () => StateModel
      ) => void | Promise<void>)
    | undefined = undefined;

  #internalStore: StateStore = createStateStore();
  #unsubscribe: (() => void) | undefined;
  #extraSheet: CSSStyleSheet | undefined;

  get #activeStore(): StateStore {
    return this.store ?? this.#internalStore;
  }

  @Observe(["spec", "store"])
  protected storeChanged(): void {
    this.#unsubscribe?.();
    if (!this.store) {
      // Reinitialise the internal store whenever the spec (and its initial
      // state) changes, or when the external store is removed.
      this.#internalStore = createStateStore(this.spec?.state ?? {});
    }
    this.#unsubscribe = this.#activeStore.subscribe(() =>
      this.requestUpdate()
    );
  }

  override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (!changedProperties.has("styleSheet" as keyof this)) return;
    if (!this.shadowRoot) return;

    // Remove the previously adopted extra sheet
    if (this.#extraSheet) {
      this.shadowRoot.adoptedStyleSheets =
        this.shadowRoot.adoptedStyleSheets.filter(s => s !== this.#extraSheet);
      this.#extraSheet = undefined;
    }
    // Adopt the new sheet
    if (this.styleSheet) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(this.styleSheet);
      this.#extraSheet = sheet;
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets,
        sheet,
      ];
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
  }

  override render() {
    if (!this.spec?.root) return nothing;
    return this.#renderElement(this.spec.root, this.spec, undefined);
  }

  #renderElement(
    key: string,
    spec: Spec,
    repeatScope: RepeatScope | undefined
  ): unknown {
    const element = spec.elements[key];
    if (!element) return nothing;

    // Snapshot once per element render to avoid stale reads within the same cycle.
    const stateModel = this.#activeStore.getSnapshot();
    const ctx: PropResolutionContext = {
      stateModel,
      repeatItem: repeatScope?.item,
      repeatIndex: repeatScope?.index,
      repeatBasePath: repeatScope?.basePath,
      functions: this.functions,
    };

    if (!evaluateVisibility(element.visible, ctx)) return nothing;

    const resolvedProps = resolveElementProps(element.props, ctx);
    const bindings = resolveBindings(element.props, ctx);
    const resolvedElement: UIElement =
      resolvedProps !== element.props
        ? { ...element, props: resolvedProps }
        : element;

    // Build children — use Lit's repeat() directive for array expansion so
    // Lit can reconcile DOM nodes by stable key, minimising mutations.
    let children: unknown[];
    if (element.repeat) {
      const items =
        (this.#activeStore.get(element.repeat.statePath) as unknown[]) ?? [];
      const keyField = element.repeat.key;
      children = [
        repeat(
          items,
          (_item, index) => {
            if (
              keyField &&
              typeof _item === "object" &&
              _item !== null
            ) {
              return String(
                (_item as Record<string, unknown>)[keyField] ?? index
              );
            }
            return String(index);
          },
          (item, index) => {
            const scope: RepeatScope = {
              item,
              index,
              basePath: `${element.repeat!.statePath}/${index}`,
            };
            return (element.children ?? []).map(childKey =>
              this.#renderElement(childKey, spec, scope)
            );
          }
        ),
      ];
    } else {
      children = (element.children ?? []).map(childKey =>
        this.#renderElement(childKey, spec, repeatScope)
      );
    }

    // emit: fires all action bindings attached to the given event name.
    const emit = (eventName: string): void => {
      const eventBinding = element.on?.[eventName];
      if (!eventBinding) return;
      const actionBindings = Array.isArray(eventBinding)
        ? eventBinding
        : [eventBinding];
      for (const b of actionBindings) {
        void executeActionBinding({
          binding: b,
          store: this.#activeStore,
          // Take a fresh snapshot so later actions in the loop see mutations
          // produced by earlier ones.
          resolutionCtx: {
            ...ctx,
            stateModel: this.#activeStore.getSnapshot(),
          },
          onAction: this.onAction
            ? (name, params) =>
                this.onAction!(
                  name,
                  params,
                  (path, value) => this.#activeStore.set(path, value),
                  () => this.#activeStore.getSnapshot()
                )
            : undefined,
        });
      }
    };

    // on: returns EventHandle metadata for the given event.
    const on = (eventName: string): EventHandle => {
      const eventBinding = element.on?.[eventName];
      if (!eventBinding) {
        return { emit: () => {}, shouldPreventDefault: false, bound: false };
      }
      const actionBindings = Array.isArray(eventBinding)
        ? eventBinding
        : [eventBinding];
      return {
        emit: () => emit(eventName),
        shouldPreventDefault: actionBindings.some(b => b.preventDefault),
        bound: true,
      };
    };

    const Renderer = this.registry[element.type] ?? this.fallback;
    if (!Renderer) {
      if (!this.loading) {
        console.warn(
          `[ch-json-render] Unknown component type: "${element.type}"`
        );
      }
      return nothing;
    }

    return Renderer({
      element: resolvedElement,
      children,
      emit,
      on,
      bindings,
      setState: (path, value) => this.#activeStore.set(path, value),
      loading: this.loading,
    });
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChJsonRenderElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChJsonRenderElement;
  }

  // prettier-ignore
  interface HTMLChJsonRenderElement extends ChJsonRender {
    // Extend the ChJsonRender class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-json-render": HTMLChJsonRenderElement;
  }

  interface HTMLElementTagNameMap {
    "ch-json-render": HTMLChJsonRenderElement;
  }
}

