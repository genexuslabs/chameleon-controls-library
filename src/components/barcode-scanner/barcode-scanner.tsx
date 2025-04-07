import {
  Component,
  h,
  Element,
  Prop,
  Event,
  EventEmitter,
  Method,
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
 * This component allows you to scan a wide variety of types of barcode and QR
 * codes.
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
   * The width (in pixels) of the QR box displayed at the center of the video.
   */
  @Prop() readonly barcodeBoxWidth: number = 200;

  /**
   * The height (in pixels) of the QR box displayed at the center of the video.
   */
  @Prop() readonly barcodeBoxHeight: number = 200;

  /**
   * Specifies the ID of the selected camera. Only works if
   * `cameraPreference === "SelectedById"`.
   */
  @Prop() readonly cameraId?: string;
  @Watch("cameraId")
  cameraChange() {
    this.#cameraIdOrScanningChange = true;
  }

  /**
   * Specifies the camera preference for scanning.
   */
  @Prop() readonly cameraPreference: "Default" | "FrontCamera" | "BackCamera" =
    "Default";

  /**
   * Specifies how much time (in ms) should pass before to emit the read event
   * with the same last decoded text. If the last decoded text is different
   * from the new decoded text, this property is ignored.
   */
  @Prop() readonly readDebounce: number = 200;

  /**
   * `true` if the control is scanning.
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
   * Fired when the control is first rendered. Contains the ids about all
   * available cameras.
   */
  @Event() cameras: EventEmitter<string[]>;

  /**
   * Fired when a new barcode is decoded.
   */
  @Event() read: EventEmitter<string>;

  /**
   * Scan a file a return a promise with the decoded text.
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
    if (!this.#html5QrCode) {
      return;
    }

    if (this.#firstTime) {
      this.#firstTime = false;
      return;
    }

    if (this.#html5QrCode.getState() !== Html5QrcodeScannerState.SCANNING) {
      return;
    }

    clearTimeout(this.#timeout);
    this.#timeout = setTimeout(this.#startScanner, 75);
  };

  #startScanner = () => {
    const aspectRatio = this.el.clientWidth / this.el.clientHeight;
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
