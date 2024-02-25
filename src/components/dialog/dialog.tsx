import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Watch,
  Prop,
  State,
  h
} from "@stencil/core";
import { isRTL } from "../../common/utils";
import { SyncWithRAF } from "../../common/sync-with-frames";

// Custom vars
const DIALOG_DRAGGED_X = "--ch-dialog-dragged-x";
const DIALOG_DRAGGED_Y = "--ch-dialog-dragged-y";

const DIALOG_RTL = "--ch-dialog-rtl";
const DIALOG_RTL_VALUE = "-1";
const DRAGGING_CLASS = "gx-dialog-dragging";

// Utils
const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

/**
 * The `ch-dialog` component represents a modal or non-modal dialog box or other interactive component.
 */
@Component({
  tag: "ch-dialog",
  styleUrl: "dialog.scss",
  shadow: true
})
export class ChDialog {
  /*
  INDEX:
  1.OWN PROPERTIES
  2.REFERENCE TO ELEMENTS
  3.STATE() VARIABLES
  4.PUBLIC PROPERTY API / WATCH'S
  5.EVENTS (EMIT)
  6.COMPONENT LIFECYCLE EVENTS
  7.LISTENERS
  8.PUBLIC METHODS API
  9.LOCAL METHODS
  10.RENDER() FUNCTION
  */

  // 1.OWN PROPERTIES //

  // Sync computations with frames
  #dragRAF: SyncWithRAF; // Don't allocate memory until needed when dragging

  // Watchers
  #checkWatchers = false;
  #rtlWatcher: MutationObserver;

  // Drag
  #draggedDistanceX: number = 0;
  #draggedDistanceY: number = 0;
  #dragging = false;
  #initialDragEvent: MouseEvent;
  #lastDragEvent: MouseEvent;
  #isRTLDirection: boolean;

  // 2. REFERENCE TO ELEMENTS //

  // Refs
  #dialogRef: HTMLDialogElement;

  @Element() el: HTMLChDialogElement;

  // 3.STATE() VARIABLES //

  @State() dragging = false;
  @State() relativeDialog = false;

  // 4.PUBLIC PROPERTY API / WATCH'S //

  /**
   * Specifies the drag behavior of the dialog.
   * If `allowDrag === "header"`, a slot with the `"header"` name will be
   * available to place the header content.
   */
  @Prop() readonly allowDrag: "box" | "header" | "no" = "box";

  /**
   * Specifies whether the dialog is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop({ mutable: true, reflect: true }) hidden = true;
  @Watch("hidden")
  handleHiddenChange(newHiddenValue: boolean) {
    // Schedule update for watchers
    this.#checkWatchers = true;

    // Update the dialog visualization
    if (newHiddenValue) {
      this.#dialogRef.close();
    } else {
      this.#showMethod();
    }
  }

  /**
   * Specifies whether the dialog is a modal or not.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly modal = true;

  /**
   * Specifies whether the dialog header is hidden or visible.
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() readonly showHeader = true;

  // 5.EVENTS (EMIT) //

  /**
   * Emitted when the dialog is opened.
   */
  @Event() dialogOpened: EventEmitter;

  /**
   * Emitted when the dialog is closed.
   */
  @Event() dialogClosed: EventEmitter;

  // 6.COMPONENT LIFECYCLE EVENTS //

  connectedCallback() {
    // Set RTL watcher
    this.#rtlWatcher = new MutationObserver(() => {
      this.#isRTLDirection = isRTL();

      if (this.#isRTLDirection) {
        this.el.style.setProperty(DIALOG_RTL, DIALOG_RTL_VALUE);
      } else {
        this.el.style.removeProperty(DIALOG_RTL);
      }
    });

    // Observe the dir attribute in the document
    this.#rtlWatcher.observe(document.documentElement, {
      attributeFilter: ["dir"]
    });
  }

  componentWillRender() {
    this.#checkWatchers &&= false;
  }

  componentDidLoad() {
    if (!this.hidden) {
      this.el.showPopover();
    }
  }

  disconnectedCallback() {
    // Defensive programming. Make sure the document does not have any unwanted handler
    this.#handleDragEnd();

    // Disconnect RTL watcher
    if (this.#rtlWatcher) {
      this.#rtlWatcher.disconnect();
      this.#rtlWatcher = null; // Free the memory
    }
  }

  // 7.LISTENERS //

  // 8.PUBLIC METHODS API //

  // 9.LOCAL METHODS //

  #addDraggingClass = () => {
    if (!this.#dragging) {
      this.#dialogRef.classList.add(DRAGGING_CLASS);
      this.#dragging = true;
    }
  };

  #removeDraggingClass = () => {
    this.#dialogRef.classList.remove(DRAGGING_CLASS);
    this.#dragging = false;
  };

  #handlePopoverToggle = (event: ToggleEvent) => {
    const willBeHidden = !(event.newState === "open");
    this.hidden = willBeHidden;

    // Emit events only when the action is committed by the user
    if (willBeHidden) {
      this.dialogClosed.emit();
    } else {
      this.dialogOpened.emit();
    }
  };

  #handleMouseDown = (event: MouseEvent) => {
    // We should not add preventDefault in this instance, because we would prevent some normal actions like clicking a button or focusing an input

    this.#dragRAF ||= new SyncWithRAF();
    this.#initialDragEvent = event;

    // Add listeners
    document.addEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true
    });

    document.addEventListener("mouseup", this.#handleDragEnd, {
      capture: true,
      passive: true
    });
  };

  #trackElementDragRAF = (event: MouseEvent) => {
    this.#dragRAF.perform(this.#trackElementDrag, () => {
      // Improve drag UX by not selecting any button or clicking interactive elements
      event.preventDefault();

      // We remove the pointer-events and user-select properties after the first "mousemove", otherwise double clicking to select text would not work
      this.#addDraggingClass();

      this.#lastDragEvent = event;
    });
  };

  #trackElementDrag = () => {
    // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
    const currentDraggedDistanceX =
      this.#lastDragEvent.clientX - this.#initialDragEvent.clientX;
    const currentDraggedDistanceY =
      this.#lastDragEvent.clientY - this.#initialDragEvent.clientY;

    // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
    // Update total dragged distance in X
    if (currentDraggedDistanceX !== 0) {
      this.#draggedDistanceX += this.#isRTLDirection // Set dragged distance depending on RTL value
        ? -currentDraggedDistanceX
        : currentDraggedDistanceX;
      setProperty(this.el, DIALOG_DRAGGED_X, this.#draggedDistanceX);
    }

    // Update total dragged distance in Y
    if (currentDraggedDistanceY !== 0) {
      this.#draggedDistanceY += currentDraggedDistanceY;
      setProperty(this.el, DIALOG_DRAGGED_Y, this.#draggedDistanceY);
    }

    // Update last point
    this.#initialDragEvent = this.#lastDragEvent;
  };

  #handleDragEnd = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    // Cancel RAF to prevent access to undefined references
    if (this.#dragRAF) {
      this.#dragRAF.cancel();
    }

    // Remove listeners
    document.removeEventListener("mousemove", this.#trackElementDragRAF, {
      capture: true
    });

    document.removeEventListener("mouseup", this.#handleDragEnd, {
      capture: true
    });

    this.#removeDraggingClass();

    // Free the memory
    this.#dragRAF = null;
    this.#initialDragEvent = null;
    this.#lastDragEvent = null;
  };

  #showMethod = () => {
    this.modal ? this.#dialogRef.showModal() : this.#dialogRef.show();
  };

  // 10.RENDER() FUNCTION //

  render() {
    return (
      <Host
        class={{
          "gx-dialog-header-drag": !this.hidden && this.allowDrag === "header"
        }}
      >
        <dialog
          onClose={this.#handlePopoverToggle}
          ref={el => (this.#dialogRef = el)}
          onMouseDown={this.allowDrag === "box" ? this.#handleMouseDown : null}
        >
          {this.showHeader && (
            <header
              class="header"
              part="header"
              onMouseDown={this.#handleMouseDown}
            >
              <slot name="header" />
            </header>
          )}
          <slot />
        </dialog>
      </Host>
    );
  }
}
