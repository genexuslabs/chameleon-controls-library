import { Component, Host, Prop, Watch, h } from "@stencil/core";
import monaco, { configureMonacoYaml } from "./monaco/output/monaco.js";

let autoId = 0;

@Component({
  shadow: false,
  styleUrl: "code-editor.scss",
  tag: "ch-code-editor"
})
export class ChCodeEditor {
  #monacoEditorInstance!: monaco.editor.IStandaloneCodeEditor;
  #monacoDiffEditorInstance!: monaco.editor.IStandaloneDiffEditor;
  #resizeObserver: ResizeObserver | undefined;

  #editorId: string = "";

  // Refs
  #monacoRef: HTMLDivElement;
  #absoluteContentRef: HTMLDivElement;

  /**
   * Allow the user to resize the diff editor split view. This property only
   * works if `mode` === `"diff-editor"`.
   */
  @Prop() readonly enableSplitViewResizing: boolean = true;
  @Watch("enableSplitViewResizing")
  enableSplitViewResizingChanged(newEnableSplitViewResizing: boolean) {
    if (this.mode === "diff-editor" && this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.updateOptions({
        enableSplitViewResizing: newEnableSplitViewResizing
      });
    }
  }

  /**
   * Specifies the language of the auto created model in the editor.
   */
  @Prop() readonly language!: string;
  @Watch("language")
  languageChanged(newLanguage: string) {
    if (this.mode === "editor") {
      monaco.editor.setModelLanguage(
        this.#monacoEditorInstance.getModel()!,
        newLanguage
      );
    } else {
      console.log(this.value, this.modifiedValue);

      this.#monacoDiffEditorInstance.setModel({
        original: monaco.editor.createModel(this.value, newLanguage),
        modified: monaco.editor.createModel(this.modifiedValue, newLanguage)
      });
    }
  }

  /**
   * Specifies the rendered mode of the editor, allowing to set a normal editor
   * or a diff editor.
   */
  @Prop() readonly mode: "editor" | "diff-editor" = "editor";

  /**
   * Specifies the modified value of the diff editor. This property only works
   * if `mode` === `"diff-editor"`.
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
   * Specifies if the modified value of the diff editor should be readonly.
   * This property only works if `mode` === `"diff-editor"`.
   */
  @Prop() readonly modifiedValueReadonly: boolean = true;
  @Watch("modifiedValueReadonly")
  modifiedValueReadonlyChanged(newModifiedValueReadonly: boolean) {
    if (this.mode === "diff-editor" && this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.updateOptions({
        readOnly: newModifiedValueReadonly
      });
    }
  }

  /**
   * Render the differences in two side-by-side editors. Only works if
   * `mode` === `"diff-editor"`.
   */
  @Prop() readonly renderSideBySide: boolean = true;
  @Watch("renderSideBySide")
  renderSideBySideChanged(newRenderSideBySide: boolean) {
    if (this.mode === "diff-editor" && this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.updateOptions({
        renderSideBySide: newRenderSideBySide
      });
    }
  }

  /**
   * Specifies the value of the editor. If `mode` === `"diff-editor"`, this
   * property will be used as the original model.
   */
  @Prop() readonly value: string;
  @Watch("value")
  valueChange(newValue: string) {
    // Editor
    if (this.mode === "editor" && this.#monacoEditorInstance) {
      this.#monacoEditorInstance.setValue(newValue);
    }
    // Diff editor
    else if (this.mode === "diff-editor" && this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.getModel()!.original.setValue(newValue);
    }
  }

  /**
   * Specifies if the editor should be readonly. When `mode` === `"diff-editor"`
   * this property will apply to the left pane.
   *  - If `mode` === `"editor"` defaults to `false`.
   *  - If `mode` === `"diff-editor"` defaults to `true`.
   */
  @Prop({ attribute: "readonly" }) readonly readonly?: boolean;
  @Watch("readonly")
  readonlyChanged(newReadonly: boolean) {
    if (this.mode === "editor" && this.#monacoEditorInstance) {
      this.#monacoEditorInstance.updateOptions({
        readOnly: newReadonly ?? false
      });
    }

    if (this.mode === "diff-editor" && this.#monacoDiffEditorInstance) {
      this.#monacoDiffEditorInstance.updateOptions({
        originalEditable: !(newReadonly ?? true)
      });
    }
  }

  /**
   * Specifies the theme to be used for rendering.
   */
  @Prop() readonly theme: string = "vs";
  @Watch("theme")
  themeChanged(newTheme: string) {
    if (this.mode === "editor") {
      this.#monacoEditorInstance.updateOptions({ theme: newTheme });
    } else {
      this.#monacoDiffEditorInstance.updateOptions({
        theme: newTheme
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

  #getYamlSchemas = () =>
    this.mode === "editor"
      ? [
          {
            // If YAML file is opened matching this glob
            fileMatch: [`**/${this.#editorId}.*`],
            // Then this schema will be downloaded from the internet and used.
            uri: this.yamlSchemaUri
          }
        ]
      : [
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

  #getCommonConfiguration = () => ({
    automaticLayout: true,
    mouseWheelScrollSensitivity: 4,
    mouseWheelZoom: true,
    theme: this.theme,
    tabSize: 2
  });

  #setupNormalEditor() {
    const editorModel = monaco.editor.createModel(
      this.value,
      this.language,
      monaco.Uri.parse(`file:///${this.#editorId}.txt`)
    );

    this.#monacoEditorInstance = monaco.editor.create(this.#monacoRef, {
      ...this.#getCommonConfiguration(),
      readOnly: this.readonly ?? false,
      model: editorModel
    });
  }

  #setupDiffEditor() {
    this.#monacoDiffEditorInstance = monaco.editor.createDiffEditor(
      this.#monacoRef,
      {
        ...this.#getCommonConfiguration(),
        enableSplitViewResizing: this.enableSplitViewResizing,
        renderSideBySide: this.renderSideBySide,
        originalEditable: !(this.readonly ?? true),
        readOnly: this.modifiedValueReadonly
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
    this.#editorId = `ch-editor-${autoId++}`;
  }

  componentDidLoad() {
    this.#configureYaml();

    if (this.mode === "editor") {
      this.#setupNormalEditor();
    } else {
      this.#setupDiffEditor();
    }

    this.#resizeObserver = new ResizeObserver(entries => {
      const absoluteContentEntry = entries[0].contentRect;

      (this.#monacoEditorInstance ?? this.#monacoDiffEditorInstance).layout({
        width: absoluteContentEntry.width,
        height: absoluteContentEntry.height
      });
    });

    this.#resizeObserver.observe(this.#absoluteContentRef);
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
