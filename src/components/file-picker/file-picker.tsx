import { Component, Event, EventEmitter, Host, Prop, h } from "@stencil/core";
import { FilePickerTranslations } from "./types";
import {
  MimeTypeFormatMap,
  MimeTypes
} from "../../common/mime-type/mime-types";
import { getMimeTypeFormat } from "../../common/mime-type/mime-type-mapping";

/**
 * TODO: Add description
 */
@Component({
  tag: "ch-file-picker",
  styleUrl: "file-picker.scss",
  shadow: true
})
export class ChFilePicker {
  #inputRef!: HTMLInputElement;

  /**
   * Specifies which kind of file format the control will filter over all
   * supported formats
   * If `undefined`, all formats are allowed.
   */
  @Prop() readonly acceptFilter: keyof MimeTypeFormatMap | undefined;

  /**
   * Specifies which kind of file formats the control supports.
   * Only used for accessibility purposes. If `undefined`, it supports more
   * than one file format
   */
  @Prop() readonly fileFormat!: keyof MimeTypeFormatMap | undefined;

  /**
   * Specifies the mimeTypes supported for the control.
   */
  @Prop() readonly supportedMimeTypes!: MimeTypes[];

  /**
   * Specifies the literals required in the control.
   */
  @Prop() readonly translations!: FilePickerTranslations;

  /**
   * Specifies the maximum number of file that can be uploaded at a time.
   */
  @Prop() readonly uploadMaxFileCount: number = 1;

  /**
   * Fired when the image picker files are changed.
   */
  @Event() filesChanged!: EventEmitter<FileList | null>;

  #handleImagePickerClick = () => this.#inputRef.click();

  #handleInputChange = (event: Event) => {
    event.stopPropagation();

    this.filesChanged.emit(this.#inputRef.files);

    // Clear the input after the event has been processed. Otherwise, selecting
    // the same file won't trigger the onChange event
    requestAnimationFrame(() => {
      this.#inputRef.value = "";
    });
  };

  #filterMimeType = (mimeType: MimeTypes) =>
    this.acceptFilter === undefined ||
    getMimeTypeFormat(mimeType) === this.acceptFilter;

  render() {
    const fileFormat = this.fileFormat ?? this.acceptFilter;
    const accessibleName = this.translations.accessibleName;
    let filePickerAccessibleName: string;

    if (fileFormat === undefined || fileFormat === "file") {
      filePickerAccessibleName = accessibleName.filePicker;
    } else if (fileFormat === "image") {
      filePickerAccessibleName = accessibleName.imagePicker;
    } else if (fileFormat === "audio") {
      filePickerAccessibleName = accessibleName.audioPicker;
    } else {
      filePickerAccessibleName = accessibleName.videoPicker;
    }

    return (
      <Host
        title={filePickerAccessibleName}
        onClick={this.#handleImagePickerClick}
      >
        <input
          aria-label={filePickerAccessibleName}
          type="file"
          accept={this.supportedMimeTypes
            .filter(this.#filterMimeType)
            .join(",")}
          multiple={this.uploadMaxFileCount > 1 ? true : undefined}
          onChange={this.#handleInputChange}
          ref={el => (this.#inputRef = el as HTMLInputElement)}
        />
      </Host>
    );
  }
}
