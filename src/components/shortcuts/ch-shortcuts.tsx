import {
  Component,
  Prop,
  Listen,
  State,
  Host,
  h,
  Element
} from "@stencil/core";
import {
  getShortcuts,
  loadShortcuts,
  unloadShortcuts
} from "./ch-shortcuts-manager";

@Component({
  tag: "ch-shortcuts",
  styleUrl: "ch-shortcuts.scss",
  shadow: true
})
export class ChShortcuts {
  @Element() el: HTMLChShortcutsElement;

  @State() showShortcuts = false;

  /**
   * The URL of the shortcut definitions.
   */
  @Prop() readonly src!: string;

  @Prop() readonly showKey = "F10";

  componentDidLoad() {
    if (this.src) {
      fetch(this.src).then(response => {
        if (response.ok) {
          response.json().then(json => {
            const root = this.el.getRootNode() as Document | ShadowRoot;
            loadShortcuts(this.src, root, json);
          });
        }
      });
    }
  }

  disconnectedCallback() {
    unloadShortcuts(this.src);
  }

  @Listen("keydown", { target: "window", capture: true })
  windowKeyDownHandler(eventInfo: KeyboardEvent) {
    if (eventInfo.key === this.showKey) {
      this.showShortcuts = !this.showShortcuts;
      eventInfo.preventDefault();
    } else if (
      this.showShortcuts &&
      !["Ctrl", "Alt", "Shift", "Meta"].includes(eventInfo.key)
    ) {
      this.showShortcuts = false;
    }
  }

  private windowClosedHandler = () => {
    this.showShortcuts = false;
  };

  private renderShortcuts() {
    return getShortcuts().map(shortcut => (
      <ch-window
        container={shortcut.element}
        modal={false}
        hidden={false}
        closeOnEscape={true}
        closeOnOutsideClick={true}
        xAlign="outside-end"
        yAlign="inside-start"
        onWindowClosed={this.windowClosedHandler}
        exportparts="mask:element"
      >
        <span part="tooltip">{shortcut.keyShortcuts}</span>
      </ch-window>
    ));
  }

  render() {
    return <Host>{this.showShortcuts && this.renderShortcuts()}</Host>;
  }
}
