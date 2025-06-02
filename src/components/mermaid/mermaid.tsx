import { Component, Host, Prop, h } from "@stencil/core";
import mermaid from "mermaid";

/**
 *
 */
@Component({
  shadow: true,
  styleUrl: "mermaid.scss",
  tag: "ch-mermaid"
})
export class ChMermaid {
  #codeRef: HTMLElement;

  /**
   * Specifies the code string to mermaid
   */
  @Prop() readonly value?: string | undefined;

  async componentDidRender() {
    await mermaid.render("asd", this.value ?? "", this.#codeRef);
  }

  render() {
    return (
      <Host>
        <pre>
          <code ref={el => (this.#codeRef = el)}></code>
        </pre>
      </Host>
    );
  }
}
