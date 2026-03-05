import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Method,
  Prop,
  Watch
} from "@stencil/core";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  QrcodeSuccessCallback
} from "html5-qrcode";

let autoId = 0;

const cameraPreferenceDictionary = {
  FrontCamera: { facingMode: { exact: "user" } },
  BackCamera: { facingMode: { exact: "environment" } }
} as const;

// TODO: Add a intersection observer to disable the scanner if it is out of
// screen to save resources

/**
 * The `ch-barcode-scanner` component provides real-time barcode and QR code scanning through the device camera, with support for file-based scanning.
 *
 * @remarks
 * ## Features
 *  - Real-time barcode and QR code scanning via the device camera using the `html5-qrcode` library.
 *  - File-based scanning through the `scan()` method, which accepts a `File` object and returns a decoded string.
 *  - Automatic camera enumeration with front-facing (`"FrontCamera"`), rear-facing (`"BackCamera"`), or specific camera selection by ID (`cameraId`).
 *  - Adaptive layout via a built-in `ResizeObserver` that restarts the scanner when the component is resized.
 *  - Configurable debouncing (`readDebounce`) to prevent duplicate `read` events for the same code.
 *  - Emits a `cameras` event on first render with the list of available camera IDs.
 *
 * ## Use when
 *  - Scanning barcodes or QR codes from a live camera feed.
 *  - Decoding barcodes from uploaded image files via the `scan()` method.
 *
 * ## Do not use when
 *  - Only generating QR codes for display — use `ch-qr` instead.
 *  - The target device has no camera and file-based scanning is not needed.
 *
 * ## Accessibility
 *  - This component renders a camera video feed inside a `<div>` without shadow DOM. It does not provide built-in keyboard controls for the camera. Ensure the surrounding UI provides accessible controls for starting/stopping the scanner.
 *
 * @status experimental
 */
@Component({
  tag: "ch-barcode-scanner",
  styleUrl: "barcode-scanner.scss",
  shadow: false
})
export class ChBarcodeScanner {
  #html5QrCode: Html5Qrcode = null;
  #scannerId: string = null;

  #firstTime = true;
  #timeout: NodeJS.Timeout;

  #resizeObserver: ResizeObserver;

  #cameraIdOrScanningChange = false;
  #cameras: string[];

  #currentCameraId: string | MediaTrackConstraints;

  // Track last scan
  #lastScan: string;
  #lastScanDateTime: Date;

  @Element() el: HTMLChBarcodeScannerElement;

  /**
   * The width (in pixels) of the scanning box displayed at the center of the
   * video feed. The scanner focuses decoding within this region.
   *
   * Defaults to `200`. Init-only — changing this value after the scanner has
   * started requires stopping and restarting via the `scanning` property.
   */
  @Prop() readonly barcodeBoxWidth: number = 200;

  /**
   * The height (in pixels) of the scanning box displayed at the center of the
   * video feed. The scanner focuses decoding within this region.
   *
   * Defaults to `200`. Init-only — changing this value after the scanner has
   * started requires stopping and restarting via the `scanning` property.
   */
  @Prop() readonly barcodeBoxHeight: number = 200;

  /**
   * Specifies the ID of the selected camera. When provided, this value takes
   * precedence over `cameraPreference` — the scanner will use the camera
   * matching this ID regardless of the `cameraPreference` setting. Camera
   * IDs are available from the `cameras` event payload emitted on first
   * render.
   *
   * Updating this value triggers a scanner restart with the new camera.
   */
  @Prop() readonly cameraId?: string;
  @Watch("cameraId")
  cameraChange() {
    this.#cameraIdOrScanningChange = true;
  }

  /**
   * Specifies the camera preference for scanning.
   *  - `"Default"`: uses the first available camera from the enumerated list.
   *  - `"FrontCamera"`: requests `facingMode: { exact: "user" }`.
   *  - `"BackCamera"`: requests `facingMode: { exact: "environment" }`.
   *
   * Ignored when `cameraId` is set.
   */
  @Prop() readonly cameraPreference: "Default" | "FrontCamera" | "BackCamera" =
    "Default";

  /**
   * Specifies the minimum time (in milliseconds) that must elapse before the
   * `read` event is re-emitted for the same decoded text. If the newly decoded
   * text differs from the last decoded text, the event fires immediately
   * regardless of this value.
   *
   * The new value applies to the next scan callback invocation.
   */
  @Prop() readonly readDebounce: number = 200;

  /**
   * Controls whether the scanner is actively scanning. Set to `true` to start
   * the camera feed and begin decoding; set to `false` to stop the camera and
   * disconnect the `ResizeObserver`.
   *
   * Toggling this property starts or stops the scanner without destroying
   * the component.
   */
  @Prop() readonly scanning: boolean = true;
  @Watch("scanning")
  scanningChange(newScanningValue: boolean) {
    if (newScanningValue) {
      this.#initializeScanning(newScanningValue);
    } else {
      this.#destroyScanner();
    }
  }

  /**
   * Emitted once during `componentDidLoad` after camera enumeration completes.
   * The payload is an array of camera ID strings. If no cameras are found or
   * enumeration fails, an empty array is emitted.
   *
   * Use this event to populate a camera selector UI.
   */
  @Event() cameras: EventEmitter<string[]>;

  /**
   * Emitted when a barcode or QR code is successfully decoded from the camera
   * feed. The payload is the decoded text string. Subject to `readDebounce`
   * filtering when the same code is scanned consecutively.
   *
   * Not cancelable.
   */
  @Event() read: EventEmitter<string>;

  /**
   * Scans a barcode or QR code from an image file and returns a promise that
   * resolves with the decoded text string. The scanner does not need to be
   * actively scanning (`scanning` can be `false`) for this method to work.
   *
   * @param imageFile - The image `File` to scan for barcodes.
   * @returns A promise that resolves with the decoded text, or rejects if no
   *   barcode is found in the image.
   */
  @Method()
  async scan(imageFile: File): Promise<string> {
    this.#html5QrCode ??= new Html5Qrcode(this.#scannerId);

    return this.#html5QrCode.scanFile(imageFile);
  }

  #onScanSuccess: QrcodeSuccessCallback = (decodedText: string) => {
    const currentDateTime = new Date();

    if (this.#lastScan === decodedText) {
      const elapsedTimeBetweenSameRead =
        currentDateTime.getTime() - this.#lastScanDateTime.getTime();

      if (elapsedTimeBetweenSameRead < this.readDebounce) {
        this.#lastScanDateTime = currentDateTime;

        return;
      }
    }

    // Update last scan values
    this.#lastScan = decodedText;
    this.#lastScanDateTime = currentDateTime;

    this.read.emit(decodedText);
  };

  #restartScanner = () => {
    clearTimeout(this.#timeout);

    if (!this.#html5QrCode) {
      this.#startScanner();
      return;
    }

    if (this.#firstTime) {
      this.#firstTime = false;
      return;
    }

    if (this.#html5QrCode.getState() !== Html5QrcodeScannerState.SCANNING) {
      return;
    }

    // Debounce start. We should probably try to use SyncWithRAF to debounce
    // with animation frames
    this.#timeout = setTimeout(this.#startScanner, 75);
  };

  #startScanner = () => {
    const { clientWidth, clientHeight } = this.el;

    // The element is collapsed or hidden. We can't compute the aspect ratio
    if (clientHeight === 0) {
      return;
    }
    const aspectRatio = clientWidth / clientHeight;

    this.#html5QrCode = new Html5Qrcode(this.#scannerId);

    this.#html5QrCode.start(
      this.#currentCameraId,
      {
        fps: 30, // Frame per seconds for QR code scanning
        qrbox: { width: this.barcodeBoxWidth, height: this.barcodeBoxHeight },
        aspectRatio: Math.max(1, aspectRatio) // At least, aspect ratio 1/1 when the height is greater than the width
      },
      this.#onScanSuccess,
      () => {} // Dummy error callback
    );
  };

  #destroyScanner = () => {
    if (this.#html5QrCode) {
      this.#html5QrCode.stop();
    }

    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  };

  #setResizeObserver = () => {
    this.#resizeObserver ??= new ResizeObserver(this.#restartScanner);
    this.#resizeObserver.observe(this.el);
  };

  #selectCameraId = () => {
    if (this.cameraId) {
      this.#currentCameraId = this.cameraId;
      return;
    }

    this.#currentCameraId =
      this.cameraPreference === "Default"
        ? this.#cameras[0] // Take the first camera when default
        : cameraPreferenceDictionary[this.cameraPreference];
  };

  #initializeScanning = (scanning: boolean) => {
    if (!scanning) {
      return;
    }

    if (this.#cameras == null || this.#cameras.length === 0) {
      return;
    }

    this.#selectCameraId();
    this.#startScanner();
    this.#setResizeObserver();
  };

  componentWillLoad() {
    this.#scannerId = `ch-barcode-scanner-${autoId++}`;
  }

  componentWillUpdate() {
    if (this.#cameraIdOrScanningChange) {
      this.#cameraIdOrScanningChange = false;
      this.#initializeScanning(this.scanning);
    }
  }

  async componentDidLoad() {
    const devices = await Html5Qrcode.getCameras();
    this.#cameras = devices == null ? [] : devices.map(device => device.id);

    this.cameras.emit(this.#cameras);
    this.#initializeScanning(this.scanning);
  }

  disconnectedCallback() {
    this.#destroyScanner();
  }

  render() {
    return (
      <div class="ch-barcode-scanner-absolute">
        <div id={this.#scannerId}></div>
      </div>
    );
  }
}
