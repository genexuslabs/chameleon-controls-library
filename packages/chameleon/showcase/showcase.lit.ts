import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";
import "../src/components/router/router.lit";
import type { RouterModel } from "../src/components/router/types";

import "../src/components/router/router.lit";
import "../src/components/switch/switch.lit";

import styles from "./showcase.scss?inline";

const routerModel: RouterModel = {
  "": {
    render: () => html`Default route`
  },
  components: {
    render: child => child,
    children: {
      accordion: {
        render: child => {
          return html`<h1>Accordion Component</h1>
            ${child}`;
        },

        children: {
          overview: {
            render: () => {
              return html`<p>Accordion Overview</p>`;
            }
          },
          api: {
            render: () => {
              return html`<p>Accordion API</p>`;
            }
          }
        }
      }
    }
  },
  "*": {
    render: () => {
      return html`Not found route (*)`;
    }
  }
};

@Component({
  styles,
  tag: "ch-showcase"
})
export class ChShowcase extends KasstorElement {
  /**
   *
   */
  @property() pathname: string | undefined;

  override render() {
    return html`<ch-router
      .model=${routerModel}
      .pathname=${this.pathname}
    ></ch-router>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-showcase": ChShowcase;
  }
}

