import { GenerativeUISample } from "./types";

export const performUIGeneration = (
  prompt: string,
  sample?: GenerativeUISample
): Promise<string> =>
  new Promise(resolve => {
    // Dummy way to generate the UI
    setTimeout(() => {
      console.log(prompt);
      const html = sample?.html ?? "<span>Hello world!</span>";

      resolve(html);
    }, 1000);
  });
