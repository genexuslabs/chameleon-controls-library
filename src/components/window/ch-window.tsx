import { Component, h, Host, Prop } from "@stencil/core";

@Component({
  tag: "ch-window",
  styleUrl: "ch-window.scss",
  shadow: true,
})
export class ChWindow {
  @Prop({ reflect: true, mutable: true }) visible = false;
  @Prop() caption = "";
  @Prop() closeText: string;
  @Prop() closeTooltip: string;
  @Prop() closeAuto: boolean;

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.visible = false;
  };

  render() {
    return (
      <Host>
        <div class="modal" part="mask" onClick={this.handleClick}>
          <section class="dialog" part="window">
            <header part="header">
              <span part="caption">{this.caption}</span>
              <button
                part="close"
                type="button"
                title={this.closeTooltip}
                onClick={this.handleClick}
              >
                {this.closeText}
              </button>
            </header>
            <main part="main">
              <slot></slot>
            </main>
            <footer part="footer">
              <slot name="footer"></slot>
            </footer>
          </section>
        </div>
      </Host>
    );
  }
}
