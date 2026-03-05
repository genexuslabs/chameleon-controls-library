import { Component, Host, Method, Prop, Watch, h } from "@stencil/core";
import monaco, {
  configureMonacoYaml
} from "../../common/monaco/output/monaco.js";
import { CodeEditorOptions } from "./code-editor-types.js";

let autoId = 0;

/**
 * The `ch-code-editor` component provides a fully-featured code editing experience powered by the [Monaco Editor](https://microsoft.github.io/monaco-editor/).
 *
 * @remarks
 * ## Features
 *  - IntelliSense, syntax highlighting, and configurable themes via Monaco Editor.
 *  - Support for any text-based language (source code, JSON, YAML, etc.).
 *  - YAML schema validation via `yamlSchemaUri`.
 *  - Monaco chunks are pre-bundled with Vite to avoid issues with StencilJS' Rollup configuration.
 *  - Automatic resize handling via `ResizeObserver`.
 *
 * ## Use when
 *  - Users need to author or edit source code, JSON, YAML, or other text-based languages.
 *  - Providing an in-app code editing experience with syntax highlighting, IntelliSense, and language support.
 *
 * ## Do not use when
 *  - Read-only code display is sufficient -- prefer `ch-code` (lightweight, no Monaco dependency).
 *  - Comparing two code versions -- prefer `ch-code-diff-editor`.
 *
 * ## Accessibility
 *  - Monaco Editor provides built-in keyboard accessibility, screen reader support, and ARIA attributes for the editing surface.
 *  - The component does not use Shadow DOM (`shadow: false`), so the Monaco editor's native accessibility features are fully available.
 *
 * ## Configuration Required
 *
 * This control requires a copy task that includes the Monaco Web Workers from
 * `@genexus/chameleon-controls-library/dist/chameleon/assets`. For example, in a StencilJS project:
 *
 * ```ts
 * // stencil.config.ts
 * import { Config } from "@stencil/core";
 *
 * export const config: Config = {
 *   namespace: "your-name-space",
 *   outputTargets: [
 *     {
 *       type: "dist",
 *       copy: [
 *         {
 *           src: "../node_modules/@genexus/chameleon-controls-library/dist/chameleon/assets",
 *           dest: "assets"
 *         }
 *       ]
 *     },
 *     {
 *       type: "www",
 *       serviceWorker: null,
 *       copy: [
 *         {
 *           src: "../node_modules/@genexus/chameleon-controls-library/dist/chameleon/assets",
 *           dest: "assets"
 *         }
 *       ]
 *     }
 *   ]
 * };
 * ```
 *
 * @status experimental
 */
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
   * Specifies the language of the auto-created model in the editor (e.g.,
   * `"typescript"`, `"json"`, `"yaml"`). Must be a valid Monaco language ID.
   * This is a required property.
   *
   * Changing the language updates the model's language mode without
   * recreating the editor instance.
   * Interacts with `yamlSchemaUri`: when language is `"yaml"` and a schema
   * URI is set, YAML validation is enabled.
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
   * Specifies the Monaco editor options passed to the editor instance on
   * creation. Changes at runtime are forwarded via `updateOptions`.
   *
   * The `theme` and `readOnly` fields in this object take precedence over
   * the dedicated `theme` and `readonly` properties when both are set.
   */
  @Prop() readonly options: CodeEditorOptions = {
    automaticLayout: true,
    mouseWheelScrollSensitivity: 4,
    mouseWheelZoom: true,
    tabSize: 2
  };
  @Watch("options")
  optionsChanged(options: CodeEditorOptions) {
    this.#monacoEditorInstance?.updateOptions({
      options
    });
  }

  /**
   * Specifies if the editor should be readonly.
   * If the `readOnly` property is specified in the `options` property,
   * this property has no effect.
   */
  @Prop({ attribute: "readonly" }) readonly readonly: boolean = false;
  @Watch("readonly")
  readonlyChanged(newReadonly: boolean) {
    this.#monacoEditorInstance?.updateOptions({
      readOnly: this.options.readOnly ?? newReadonly
    });
  }

  /**
   * Specifies the Monaco theme to be used for rendering (e.g., `"vs"`,
   * `"vs-dark"`, `"hc-black"`).
   *
   * Overridden if `options.theme` is set.
   */
  @Prop() readonly theme: string = "vs";
  @Watch("theme")
  themeChanged(newTheme: string) {
    this.#monacoEditorInstance.updateOptions({ theme: newTheme });
  }

  /**
   * Specifies the text content of the editor.
   * Setting this property replaces the entire editor content (cursor
   * position and undo stack may be affected).
   */
  @Prop() readonly value: string;
  @Watch("value")
  valueChange(newValue: string) {
    this.#monacoEditorInstance?.setValue(newValue);
  }

  /**
   * Specifies a remote schema URI for YAML language validation.
   * Only takes effect when `language` is `"yaml"`. When changed at runtime,
   * the editor model is recreated to apply the new schema.
   * Set to an empty string to disable schema validation.
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

  /**
   * Update the editor's options after the editor has been created.
   * @param options Set of options to be updated
   */
  @Method()
  async updateOptions(options: CodeEditorOptions) {
    this.#monacoEditorInstance?.updateOptions(options);
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
      readOnly: this.options.readOnly ?? this.readonly,
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
