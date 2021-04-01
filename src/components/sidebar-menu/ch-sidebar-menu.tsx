import { Component, Host, h, Prop, getAssetPath, State } from "@stencil/core";

@Component({
  tag: "ch-sidebar-menu",
  styleUrl: "ch-sidebar-menu.scss",
  shadow: true,
  assetsDirs: ["sidebar-menu-assets"],
})
export class ChSidebarMenu {
  private iconArrowLeft: string = getAssetPath(
    `./sidebar-menu-assets/arrow-left.svg`
  );

  /*
   * The menu title
   */
  @Prop() menuTitle: string;

  componentDidLoad() {}

  render() {
    return (
      <Host>
        <nav id="menu">
          <h1 id="title">{this.menuTitle}</h1>
          <main id="main">
            <slot></slot>
          </main>
          <footer id="footer">
            <slot name="footer" />
            <div id="collapse-menu">
              <ch-icon
                style={{
                  "--icon-color": "#000",
                  "--icon-size": "20px",
                }}
                src={this.iconArrowLeft}
              ></ch-icon>
            </div>
          </footer>
        </nav>
      </Host>
    );
  }
}
