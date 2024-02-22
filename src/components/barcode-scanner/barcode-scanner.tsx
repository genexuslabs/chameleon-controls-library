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

/**
 * @slot readerContainer - The slot where live the code reader tool.
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

  #cameraChange = false;
  #cameras: string[];

  #currentCameraId: string | MediaTrackConstraints;

  // Track last scan
  #lastScan: string;
  #lastScanDateTime: Date;

  @Element() el: HTMLChBarcodeScannerElement;

  /**
   * Specifies the ID of the selected camera. Only works if
   * `cameraPreference === "SelectedById"`.
   */
  @Prop() readonly cameraId?: string;
  @Watch("cameraId")
  cameraChange() {
    this.#cameraChange = true;
  }

  /**
   * Specifies the camera preference for scanning.
   */
  @Prop() readonly cameraPreference:
    | "Default"
    | "FrontCamera"
    | "BackCamera"
    | "SelectedById" = "Default";

  /**
   * Specifies how much time (in ms) should pass before to emit the read event
   * with the same last decoded text. If the last decoded text is different
   * from the new decoded text, this property is ignored.
   */
  @Prop() readonly intervalBetweenReadsForTheSameDecode: number = 200;

  /**
   * @todo Add support
   */
  @Prop() readonly scanMode: "camera" | "file" = "camera";

  /**
   * `true` if the control should stop the scanning.
   */
  @Prop() readonly stopped: boolean;
  @Watch("stopped")
  stoppedChange(newStoppedValue: boolean) {
    if (newStoppedValue) {
      this.#destroyScanner();
    } else {
      this.#initializeScanning();
    }
  }

  /**
   * The width (in pixels) of the QR box displayed at the center of the video.
   */
  @Prop() readonly qrBoxWidth: number = 200;

  /**
   * The height (in pixels) of the QR box displayed at the center of the video.
   */
  @Prop() readonly qrBoxHeight: number = 200;

  /**
   * Fired when the menu action is activated.
   */
  @Event() read: EventEmitter<string>;

  /**
   * Fired when the control is first rendered. Contains the ids about all
   * available cameras.
   */
  @Event() cameras: EventEmitter<string[]>;

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

      if (
        elapsedTimeBetweenSameRead < this.intervalBetweenReadsForTheSameDecode
      ) {
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
        qrbox: { width: this.qrBoxWidth, height: this.qrBoxWidth },
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

  #initializeScanning = () => {
    if (
      this.#cameras == null ||
      this.#cameras.length === 0 ||
      (this.cameraPreference === "SelectedById" && !this.cameraId)
    ) {
      return;
    }

    if (this.cameraId && this.cameraPreference === "SelectedById") {
      this.#currentCameraId = this.cameraId;
    } else {
      this.#currentCameraId =
        this.cameraPreference === "Default"
          ? this.#cameras[0] // Take the first camera when default
          : cameraPreferenceDictionary[this.cameraPreference];
    }

    this.#startScanner();
    this.#setResizeObserver();
  };

  componentWillLoad() {
    this.#scannerId = `ch-barcode-scanner-${autoId++}`;
  }

  componentWillRender() {
    if (!this.#cameraChange) {
      return;
    }
    this.#cameraChange = false;

    if (this.cameraPreference !== "SelectedById") {
      return;
    }

    if (this.cameraId) {
      this.#currentCameraId = this.cameraId;
      this.#startScanner();
    } else {
      this.#destroyScanner();
    }
  }

  componentDidLoad() {
    Html5Qrcode.getCameras().then(devices => {
      this.#cameras = devices == null ? [] : devices.map(device => device.id);

      this.cameras.emit(this.#cameras);

      if (!this.stopped) {
        this.#initializeScanning();
      }
    });
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
