import { Component, Prop, Host, h } from "@stencil/core";

@Component({
  shadow: true,
  styleUrl: "showcase.scss",
  tag: "ch-showcase"
})
export class ChShowcase {
  /**
   *
   */
  @Prop() readonly pageName: string;

  /**
   *
   */
  @Prop() readonly pageSrc: string;

  render() {
    return (
      <Host>
        <h1 class="heading">{this.pageName}</h1>

        <iframe src={this.pageSrc} frameborder="0"></iframe>
      </Host>
    );
  }
}
