import { Component, Host, Prop, Watch, h } from "@stencil/core";
import monaco, {
  configureMonacoYaml
} from "../../common/monaco/output/monaco.js";
import { CodeEditorOptions } from "./code-editor-types.js";

let autoId = 0;

@Component({
  shadow: false,
  styleUrl: "code-editor.scss",
  tag: "ch-code-editor"
})
export class ChCodeEditor {
  #monacoEditorInstance!: monaco.editor.IStandaloneCodeEditor;
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
    monaco.editor.setModelLanguage(
      this.#monacoEditorInstance.getModel()!,
      newLanguage
    );
  }

  /**
   * Specifies the theme to be used for rendering.
   */
  @Prop() readonly theme: string = "vs";
  @Watch("theme")
  themeChanged(newTheme: string) {
    this.#monacoEditorInstance.updateOptions({ theme: newTheme });
  }

  /**
   * Specifies the editor options.
   */
  @Prop() readonly options: CodeEditorOptions = {
    automaticLayout: true,
    mouseWheelScrollSensitivity: 4,
    mouseWheelZoom: true,
    tabSize: 2
  };

  /**
   * Specifies the value of the editor.
   */
  @Prop() readonly value: string;
  @Watch("value")
  valueChange(newValue: string) {
    // Editor
    if (this.#monacoEditorInstance) {
      this.#monacoEditorInstance.setValue(newValue);
    }
  }

  /**
   * Specifies if the editor should be readonly.
   */
  @Prop({ attribute: "readonly" }) readonly readonly: boolean = false;
  @Watch("readonly")
  readonlyChanged(newReadonly: boolean) {
    if (this.#monacoEditorInstance) {
      this.#monacoEditorInstance.updateOptions({
        readOnly: newReadonly ?? false
      });
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
    this.#editorId = `ch-editor-${autoId++}`;

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

    this.#monacoEditorInstance.setModel(
      monaco.editor.createModel(
        this.value,
        this.language,
        monaco.Uri.parse(`file:///${this.#editorId}.txt`)
      )
    );
  }

  #getYamlSchemas = () => [
    {
      // If YAML file is opened matching this glob
      fileMatch: [`**/${this.#editorId}.*`],
      // Then this schema will be downloaded from the internet and used.
      uri: this.yamlSchemaUri
    }
  ];

  #setupNormalEditor() {
    const editorModel = monaco.editor.createModel(
      this.value,
      this.language,
      monaco.Uri.parse(`file:///${this.#editorId}.txt`)
    );

    this.#monacoEditorInstance = monaco.editor.create(this.#monacoRef, {
      ...this.options,
      theme: this.options.theme ?? this.theme,
      ...(!("readOnly" in this.options) && {
        readOnly: this.readonly
      }),
      model: editorModel
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
    this.#editorId = `ch-editor-${autoId++}`;
  }

  componentDidLoad() {
    this.#configureYaml();
    this.#setupNormalEditor();

    this.#resizeObserver = new ResizeObserver(entries => {
      const absoluteContentEntry = entries[0].contentRect;

      this.#monacoEditorInstance.layout({
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
          class="ch-code-editor-absolute-content"
          ref={el => (this.#absoluteContentRef = el)}
        >
          <div ref={el => (this.#monacoRef = el)}></div>
        </div>
      </Host>
    );
  }
}
