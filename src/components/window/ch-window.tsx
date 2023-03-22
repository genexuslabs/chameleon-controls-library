import { Component, h, Host, Prop, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-window",
  styleUrl: "ch-window.scss",
  shadow: true
})
export class ChWindow {
  @Prop({ reflect: true, mutable: true }) hidden = true;
  @Prop({ reflect: true }) readonly modal: boolean = true;
  @Prop() readonly caption: string = "";
  @Prop() readonly closeText: string;
  @Prop() readonly closeTooltip: string;
  @Prop() readonly closeAuto: boolean;

  @Event() windowClosed: EventEmitter;

  private handleMaskClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    if (this.closeAuto) {
      this.close();
    }
  };

  private handleCloseClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.close();
  };

  private handleDialogClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
  };

  private close() {
    this.hidden = true;
    this.windowClosed.emit();
  }

  render() {
    return (
      <Host>
        <div class="mask" part="mask" onClick={this.handleMaskClick}>
          <section
            class="window"
            part="window"
            onClick={this.handleDialogClick}
          >
            <header part="header">
              <span part="caption">{this.caption}</span>
              <button
                part="close"
                type="button"
                title={this.closeTooltip}
                onClick={this.handleCloseClick}
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
