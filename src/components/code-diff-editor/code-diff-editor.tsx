import { Component, Host, Prop, Watch, h } from "@stencil/core";
import monaco, {
  configureMonacoYaml
} from "../../common/monaco/output/monaco.js";
import { CodeDiffEditorOptions } from "./code-diff-editor-types.js";

let autoId = 0;

@Component({
  shadow: false,
  styleUrl: "code-diff-editor.scss",
  tag: "ch-code-diff-editor"
})
export class ChCodeDiffEditor {
  #monacoDiffEditorInstance!: monaco.editor.IStandaloneDiffEditor;
  #resizeObserver: ResizeObserver | undefined;

  #editorId: string = "";

  // Refs
  #monacoRef: HTMLDivElement;
  #absoluteContentRef: HTMLDivElement;

  /**
   * Specifies the language of the auto created model in the editor.
   */
  @Prop() readonly language!: string;
  @Watch("language")
  languageChanged(newLanguage: string) {
    this.#monacoDiffEditorInstance.setModel({
      original: monaco.editor.createModel(this.value, newLanguage),
      modified: monaco.editor.createModel(this.modifiedValue, newLanguage)
    });
  }

  /**
   * Specifies the theme to be used for rendering.
   */
  @Prop() readonly theme: string = "vs";
  @Watch("theme")
  themeChanged(newTheme: string) {
    this.#monacoDiffEditorInstance.updateOptions({
      theme: newTheme
    });
  }

  /**
   * Specifies the editor options.
   */
  @Prop() readonly options: CodeDiffEditorOptions = {
    theme: this.theme,
    automaticLayout: true,
    mouseWheelScrollSensitivity: 4,
    mouseWheelZoom: true,
    enableSplitViewResizing: true,
    renderSideBySide: true
  };

  /**
   * Specifies if the editor should be readonly.
   */
  @Prop({ attribute: "readonly" }) readonly readonly: boolean = true;
  @Watch("readonly")
  readonlyChanged(newReadonly: boolean) {
    if (this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.updateOptions({
        originalEditable: !newReadonly ?? true,
        readOnly: newReadonly ?? false
      });
    }
  }

  /**
   * Specifies the original value of the diff editor.
   */
  @Prop() readonly value: string;
  @Watch("value")
  valueChange(newValue: string) {
    if (this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.getModel()!.original.setValue(newValue);
    }
  }

  /**
   * Specifies the modified value of the diff editor.
   */
  @Prop({ attribute: "modified-value" }) readonly modifiedValue: string;
  @Watch("modifiedValue")
  modifiedValueChange(newModifiedValue: string) {
    if (this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance
        .getModel()!
        .modified.setValue(newModifiedValue);
    }
  }

  /**
   * Specifies the schema URI for the YAML language.
   */
  @Prop() readonly yamlSchemaUri: string = "";
  @Watch("yamlSchemaUri")
  yamlSchemaUriChange(newUri: string) {
    if (this.language !== "yaml") {
      return;
    }

    // Necessary to not combine the current scheme with the new scheme
    this.#editorId = `ch-diff-editor-${autoId++}`;

    if (newUri) {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        format: true,
        schemas: this.#getYamlSchemas()
      });
    } else {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        format: true,
        schemas: []
      });
    }

    this.#monacoDiffEditorInstance.setModel({
      original: monaco.editor.createModel(
        this.value,
        this.language,
        monaco.Uri.parse(`file:///${this.#editorId}.txt`)
      ),
      modified: monaco.editor.createModel(
        this.modifiedValue,
        this.language,
        monaco.Uri.parse(`file:///${this.#editorId}-modified.txt`)
      )
    });
  }

  #getYamlSchemas = () => [
    {
      // If YAML file is opened matching this glob
      fileMatch: [`**/${this.#editorId}.*`],
      // Then this schema will be downloaded from the internet and used.
      uri: this.yamlSchemaUri
    },
    {
      // If YAML file is opened matching this glob
      fileMatch: [`**/${this.#editorId}-modified.*`],
      // Then this schema will be downloaded from the internet and used.
      uri: this.yamlSchemaUri
    }
  ];

  #setupDiffEditor() {
    this.#monacoDiffEditorInstance = monaco.editor.createDiffEditor(
      this.#monacoRef,
      {
        ...this.options,
        ...(!(
          "originalEditable" in this.options || "readOnly" in this.options
        ) && {
          originalEditable: !this.readonly,
          readOnly: this.readonly
        })
      }
    );

    this.#monacoDiffEditorInstance.setModel({
      original: monaco.editor.createModel(
        this.value,
        this.language,
        monaco.Uri.parse(`file:///${this.#editorId}.txt`)
      ),
      modified: monaco.editor.createModel(
        this.modifiedValue,
        this.language,
        monaco.Uri.parse(`file:///${this.#editorId}-modified.txt`)
      )
    });
  }

  #configureYaml() {
    if (this.language === "yaml" && !!this.yamlSchemaUri) {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        format: true,
        schemas: this.#getYamlSchemas()
      });
    }
  }

  connectedCallback(): void {
    this.#editorId = `ch-diff-editor-${autoId++}`;
  }

  componentDidLoad() {
    this.#configureYaml();
    this.#setupDiffEditor();

    this.#resizeObserver = new ResizeObserver(entries => {
      const absoluteContentEntry = entries[0].contentRect;

      this.#monacoDiffEditorInstance.layout({
        width: absoluteContentEntry.width,
        height: absoluteContentEntry.height
      });
    });

    this.#resizeObserver.observe(this.#absoluteContentRef);
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  render() {
    return (
      <Host>
        <div
          class="ch-code-diff-editor-absolute-content"
          ref={el => (this.#absoluteContentRef = el)}
        >
          <div ref={el => (this.#monacoRef = el)}></div>
        </div>
      </Host>
    );
  }
}
