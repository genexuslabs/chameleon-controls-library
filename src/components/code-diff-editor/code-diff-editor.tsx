import { Component, Host, Method, Prop, Watch, h } from "@stencil/core";
import monaco, {
  configureMonacoYaml
} from "../../common/monaco/output/monaco.js";
import { CodeDiffEditorOptions } from "./code-diff-editor-types.js";

let autoId = 0;

/**
 * The `ch-code-diff-editor` component provides a side-by-side or inline diff
 * view for comparing two versions of source code, powered by the
 * [Monaco Editor](https://microsoft.github.io/monaco-editor/).
 *
 * @remarks
 * ## Features
 *  - Side-by-side and inline diff rendering with syntax highlighting.
 *  - Scroll synchronization and inline change decorations.
 *  - Configurable themes, read-only mode, and YAML schema validation.
 *
 * ## Use when
 *  - Visualizing textual differences between an original and a modified document.
 *  - Showing a before/after comparison of two code versions (e.g., pull request diffs, AI-generated code changes).
 *
 * ## Do not use when
 *  - You need single-document editing — prefer `ch-code-editor` instead.
 *  - You need read-only highlighted code — prefer `ch-code` instead.
 *  - Only one version needs to be displayed — prefer `ch-code-editor` or `ch-code`.
 *
 * **Important:** Like `ch-code-editor`, this control requires the Monaco Web
 * Workers to be copied into your project's assets. See the `ch-code-editor`
 * documentation for the required copy-task configuration.
 *
 * @status experimental
 */
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
    this.#monacoDiffEditorInstance?.setModel({
      original: monaco.editor.createModel(this.value, newLanguage),
      modified: monaco.editor.createModel(this.modifiedValue, newLanguage)
    });
  }

  /**
   * Specifies the modified value of the diff editor.
   */
  @Prop({ attribute: "modified-value" }) readonly modifiedValue: string;
  @Watch("modifiedValue")
  modifiedValueChange(newModifiedValue: string) {
    this.#monacoDiffEditorInstance
      ?.getModel()!
      .modified.setValue(newModifiedValue);
  }

  /**
   * Specifies the editor options.
   */
  @Prop() readonly options: CodeDiffEditorOptions = {
    automaticLayout: true,
    mouseWheelScrollSensitivity: 4,
    mouseWheelZoom: true,
    enableSplitViewResizing: true,
    renderSideBySide: true
  };
  @Watch("options")
  optionsChanged(options: CodeDiffEditorOptions) {
    this.#monacoDiffEditorInstance?.updateOptions({
      options
    });
  }

  /**
   * Specifies if the editor should be readonly.
   * If the `readOnly` or `originalEditable` property is specified in the `options` property,
   * this property has no effect.
   */
  @Prop({ attribute: "readonly" }) readonly readonly: boolean = true;
  @Watch("readonly")
  readonlyChanged(newReadonly: boolean) {
    this.#monacoDiffEditorInstance?.updateOptions({
      originalEditable: this.options.originalEditable ?? !newReadonly,
      readOnly: this.options.readOnly ?? newReadonly
    });
  }

  /**
   * Specifies the theme to be used for rendering.
   */
  @Prop() readonly theme: string = "vs";
  @Watch("theme")
  themeChanged(newTheme: string) {
    this.#monacoDiffEditorInstance?.updateOptions({
      theme: newTheme
    });
  }

  /**
   * Specifies the original value of the diff editor.
   */
  @Prop() readonly value: string;
  @Watch("value")
  valueChange(newValue: string) {
    this.#monacoDiffEditorInstance?.getModel()!.original.setValue(newValue);
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

  /**
   * Update the editor's options after the editor has been created.
   * @param options Set of options to be updated
   */
  @Method()
  async updateOptions(options: CodeDiffEditorOptions) {
    this.#monacoDiffEditorInstance?.updateOptions(options);
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
        theme: this.options.theme ?? this.theme,
        originalEditable: this.options.originalEditable ?? !this.readonly,
        readOnly: this.options.readOnly ?? this.readonly
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
