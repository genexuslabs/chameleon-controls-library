import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

import type { RouterItemModel, RouterModel } from "./types";

import { DEV_MODE } from "../../development-flags";
import styles from "./router.scss?inline";

/**
 * @status developer-preview
 */
@Component({
  styles,
  tag: "ch-router"
})
export class ChRouter extends KasstorElement {
  /**
   *
   */
  @property() model: RouterModel | undefined;

  /**
   *
   */
  @property() pathname: string | undefined;

  #renderRouterItem = (
    item: RouterItemModel,
    pathSegments: string[]
  ): TemplateResult | undefined | typeof nothing => {
    const childSegment = pathSegments.shift();

    if (childSegment === undefined) {
      return item.render();
    }

    if (item.children === undefined) {
      if (DEV_MODE) {
        console.warn(
          `The route has no children to render, but a child in the path was provided ("${pathSegments.join("/")}")`,
          item
        );
      }

      return item.render();
    }

    // Try to match the route
    const childModel = item.children[childSegment];

    if (childModel === undefined) {
      return this.#renderNotFound();
    }

    return item.render(this.#renderRouterItem(childModel, pathSegments));
  };

  #renderNotFound = () => {
    if (DEV_MODE) {
      console.warn(
        "The route was not found in the model",
        this.pathname,
        this.model
      );
    }

    return this.model!["*"]?.render() ?? this.model!["**"]?.render() ?? nothing;
  };

  #renderPathname = () => {
    const actualPathname = this.pathname!.replace(/^\//, "");
    const pathSegments = actualPathname.split("/");

    const firstSegment = pathSegments.shift();

    // Default route
    if (firstSegment === undefined) {
      const defaultRoute = this.model![""] ?? this.model!["/"];
      return defaultRoute ? defaultRoute.render() : nothing;
    }

    // Try to match the route
    const itemModel = this.model![firstSegment];

    return itemModel
      ? this.#renderRouterItem(itemModel, pathSegments)
      : this.#renderNotFound();
  };

  override render() {
    if (this.model === undefined || this.pathname === undefined) {
      return nothing;
    }

    return this.#renderPathname();
  }
}

export default ChRouter;

declare global {
  interface HTMLElementTagNameMap {
    "ch-router": ChRouter;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChRouterElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChRouterElement;
  }

  /**
   * @status developer-preview
   */// prettier-ignore
  interface HTMLChRouterElement extends ChRouter {
    // Extend the ChRouter class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-router": HTMLChRouterElement;
  }

  interface HTMLElementTagNameMap {
    "ch-router": HTMLChRouterElement;
  }
}

