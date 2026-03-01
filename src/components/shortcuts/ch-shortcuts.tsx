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

/**
 * The `ch-shortcuts` component loads keyboard shortcut definitions from a JSON
 * file and displays discoverable tooltip hints next to target elements when the
 * user presses a trigger key.
 *
 * @remarks
 * ## Features
 *  - Loads shortcut definitions from an external JSON file.
 *  - Toggles visual key-combination hints on/off via a configurable trigger key (default F10).
 *  - Tooltips positioned relative to target elements using `ch-window`.
 *  - Auto-hides hints when any non-modifier key is pressed.
 *  - Runtime suspend/resume without unloading the hint UI.
 *
 * ## Use when
 *  - Your application provides power-user keyboard shortcuts and you want a discoverable overlay similar to desktop productivity tools.
 *  - Providing discoverable keyboard shortcut hints for power users in a complex application.
 *
 * ## Do not use when
 *  - You need to define keyboard bindings -- this component only visualizes externally configured shortcuts.
 *  - Keyboard shortcuts do not exist or are not implemented in the application.
 *
 * ## Accessibility
 *  - Shortcut hints are rendered using `<kbd>` elements for proper semantic meaning.
 *  - Triggered by a configurable key (default F10), respecting modifier key state.
 *
 * @status experimental
 *
 * @part plus - The "+" separator rendered between keys in a combination (e.g., Ctrl **+** S).
 * @part slash - The "/" separator rendered between alternative keys in a shortcut definition.
 * @part key - Each individual `<kbd>` element representing a single key in the shortcut.
 */
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
      }
      if (key === " " && i > 0 && items[i - 1] !== "+") {
        return <span part="slash">/</span>;
      }
      return <kbd part={`key`}>{KEY_SYMBOL[key] ?? key}</kbd>;
    });
  }

  render() {
    return <Host>{this.showShortcuts && this.renderShortcuts()}</Host>;
  }
}
