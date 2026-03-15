import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";

import styles from "./showcase-getting-started.scss?inline";

@Component({
  styles,
  tag: "showcase-getting-started"
})
export class ShowcaseGettingStarted extends KasstorElement {
  override render() {
    return html`
      <article class="content" part="content">
        <h1>Getting Started</h1>

        <h2 id="installation">Installation</h2>
        <p>Install Chameleon via your preferred package manager:</p>
        <pre
          class="code-block"
        ><code>npm install @genexus/chameleon-controls-library-lit</code></pre>

        <h2 id="usage">Basic Usage</h2>
        <p>
          Import the component you need and use it in your HTML. Chameleon
          components are Web Components, so they work in any framework.
        </p>
        <pre class="code-block"><code>&lt;script type="module"&gt;
  import "@genexus/chameleon-controls-library-lit/components/checkbox.js";
&lt;/script&gt;

&lt;ch-checkbox caption="Accept terms"&gt;&lt;/ch-checkbox&gt;</code></pre>

        <h2 id="frameworks">Framework Integration</h2>
        <p>
          Chameleon works with Angular, React, Vue, and any other framework that
          supports Web Components. Check each component's overview page for
          framework-specific examples.
        </p>

        <h2 id="theming">Theming</h2>
        <p>
          Components are styled using CSS custom properties and shadow parts.
          Load a theme bundle or create your own styles.
        </p>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-getting-started": ShowcaseGettingStarted;
  }
}
