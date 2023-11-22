import {
  Component,
  Prop,
  Listen,
  State,
  Host,
  h,
  Element,
  Watch
} from "@stencil/core";
import {
  Shortcut,
  getShortcuts,
  loadShortcuts,
  unloadShortcuts
} from "./ch-shortcuts-manager";

const KEY_SYMBOL = {
  " ": "\u2334"
};

@Component({
  tag: "ch-shortcuts",
  styleUrl: "ch-shortcuts.scss",
  shadow: true
})
export class ChShortcuts {
  private shortcuts: Shortcut[];

  @Element() el: HTMLChShortcutsElement;

  @State() showShortcuts = false;

  /**
   * The URL of the shortcut definitions.
   */
  @Prop() readonly src!: string;

  /**
   * Key to show shortcut tooltips.
   */
  @Prop() readonly showKey = "F10";

  /**
   * Suspend shortcuts.
   */
  @Prop() readonly suspend: boolean = false;

  @Watch("suspend")
  suspendHandler() {
    if (this.suspend) {
      unloadShortcuts(this.src);
    } else {
      const root = this.el.getRootNode() as Document | ShadowRoot;
      loadShortcuts(this.src, root, this.shortcuts);
    }
  }

  componentDidLoad() {
    if (this.src) {
      fetch(this.src).then(response => {
        if (response.ok) {
          response.json().then(json => {
            const root = this.el.getRootNode() as Document | ShadowRoot;
            this.shortcuts = json;

            loadShortcuts(this.src, root, this.shortcuts);
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
    const modifierKeys = ["Ctrl", "Alt", "Shift", "Meta"];

    if (eventInfo.repeat || this.suspend) {
      return;
    }

    if (eventInfo.key === this.showKey) {
      this.showShortcuts = !this.showShortcuts;
      eventInfo.preventDefault();
    } else if (this.showShortcuts && !modifierKeys.includes(eventInfo.key)) {
      this.showShortcuts = false;
    }
  }

  private windowClosedHandler = () => {
    this.showShortcuts = false;
  };

  private renderShortcuts() {
    return getShortcuts(this.src)
      .filter(shortcut => shortcut.element)
      .map(shortcut => (
        <ch-window
          container={shortcut.element}
          modal={false}
          hidden={false}
          closeOnEscape={true}
          closeOnOutsideClick={true}
          xAlign="outside-end"
          yAlign="inside-start"
          onWindowClosed={this.windowClosedHandler}
          exportparts="mask:element, main:tooltip"
        >
          {this.renderKeyShortcuts(shortcut.keyShortcuts)}
        </ch-window>
      ));
  }

  private renderKeyShortcuts(keyShortcuts: string) {
    return keyShortcuts.split(/(?<!(?:[+]|^))([+\s])/).map((key, i, items) => {
      if (key === "+" && i > 0 && items[i - 1] !== "+") {
        return <span part="plus">+</span>;
      } else if (key === " " && i > 0 && items[i - 1] !== "+") {
        return <span part="slash">/</span>;
      } else {
        return <kbd part={`key`}>{KEY_SYMBOL[key] ?? key}</kbd>;
      }
    });
  }

  render() {
    return <Host>{this.showShortcuts && this.renderShortcuts()}</Host>;
  }
}
