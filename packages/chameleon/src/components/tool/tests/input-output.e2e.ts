import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChTool } from "../tool.lit";
import "../tool.lit.js";

describe("[ch-tool][input-output]", () => {
  afterEach(cleanup);

  describe("input rendering", () => {
    it("should render input parameters with ch-code when input is provided", async () => {
      const input = {
        query: "test query",
        maxResults: 10,
        language: "en"
      };

      const result = await render(
        html`<ch-tool
          tool-name="search"
          state="input-available"
          .input=${input}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
      expect(toolRef.input).toEqual(input);
    });

    it("should render parameters section title", async () => {
      const input = { param: "value" };

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="input-available"
          .input=${input}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const sectionTitle = toolRef.shadowRoot!.querySelector(
        ".tool__section-title"
      );
      expect(sectionTitle).toBeTruthy();
      expect(sectionTitle?.textContent?.trim()).toBe("Parameters");
    });

    it("should not render input section when input is null", async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="input-available"
          .input=${null}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.input).toBeNull();
    });

    it("should handle complex nested input objects", async () => {
      const input = {
        filters: {
          category: "technology",
          tags: ["ai", "ml", "deep-learning"]
        },
        pagination: {
          page: 1,
          limit: 20
        }
      };

      const result = await render(
        html`<ch-tool
          tool-name="advanced-search"
          state="input-available"
          .input=${input}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.input).toEqual(input);
      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
    });

    it("should handle empty input object", async () => {
      const input = {};

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="input-available"
          .input=${input}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.input).toEqual({});
      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
    });
  });

  describe("output rendering", () => {
    it("should render output with ch-code when output is an object", async () => {
      const output = {
        status: "success",
        data: {
          results: [1, 2, 3],
          total: 3
        }
      };

      const result = await render(
        html`<ch-tool
          tool-name="api-call"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.output).toEqual(output);
      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      expect(codeElements.length).toBeGreaterThan(0);
    });

    it("should render output when output is a string", async () => {
      const output = "Simple text output";

      const result = await render(
        html`<ch-tool
          tool-name="echo"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.output).toBe(output);
      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      expect(codeElements.length).toBeGreaterThan(0);
    });

    it("should render result section title", async () => {
      const output = { result: "success" };

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const titles = toolRef.shadowRoot!.querySelectorAll(
        ".tool__section-title"
      );
      // Find the "Result" title
      const resultTitle = Array.from(titles).find(
        (title) => title.textContent?.trim() === "Result"
      );
      expect(resultTitle).toBeTruthy();
    });

    it("should not render output section when output is null", async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="input-available"
          .output=${null}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.output).toBeNull();
    });

    it("should handle complex nested output objects", async () => {
      const output = {
        response: {
          headers: {
            "content-type": "application/json"
          },
          body: {
            items: [
              { id: 1, name: "Item 1" },
              { id: 2, name: "Item 2" }
            ]
          }
        }
      };

      const result = await render(
        html`<ch-tool
          tool-name="http-request"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.output).toEqual(output);
      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      expect(codeElements.length).toBeGreaterThan(0);
    });
  });

  describe("input and output together", () => {
    it("should render both input and output sections", async () => {
      const input = { query: "test" };
      const output = { results: ["result1", "result2"] };

      const result = await render(
        html`<ch-tool
          tool-name="search"
          state="output-available"
          .input=${input}
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.input).toEqual(input);
      expect(toolRef.output).toEqual(output);

      // Should have multiple ch-code elements (one for input, one for output)
      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      expect(codeElements.length).toBeGreaterThanOrEqual(2);
    });

    it("should render sections in correct order", async () => {
      const input = { param: "value" };
      const output = { result: "success" };

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="output-available"
          .input=${input}
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const titles = toolRef.shadowRoot!.querySelectorAll(
        ".tool__section-title"
      );
      const titlesArray = Array.from(titles).map((t) =>
        t.textContent?.trim()
      );

      // Parameters should come before Result
      const paramsIndex = titlesArray.indexOf("Parameters");
      const resultIndex = titlesArray.indexOf("Result");

      expect(paramsIndex).toBeGreaterThanOrEqual(0);
      expect(resultIndex).toBeGreaterThan(paramsIndex);
    });
  });

  describe("ch-code language attribute", () => {
    it("should set language to json for input", async () => {
      const input = { key: "value" };

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="input-available"
          .input=${input}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
      expect(codeElement?.getAttribute("language")).toBe("json");
    });

    it("should set language to json for output object", async () => {
      const output = { result: "success" };

      const result = await render(
        html`<ch-tool
          tool-name="test"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      const toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      // Find the one for output (should be the last or only one if no input)
      const outputCode = Array.from(codeElements).find((el) => {
        return el.getAttribute("language") === "json";
      });
      expect(outputCode).toBeTruthy();
    });
  });
});
