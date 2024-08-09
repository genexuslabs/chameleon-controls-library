import { GenerativeUISample } from "./types";

export const performUIGeneration = (
  prompt: string,
  html:string|Promise<string>,
  sample?: GenerativeUISample
): Promise<string> =>
  new Promise(resolve => {
    // Dummy way to generate the UI
    setTimeout(() => {
      html = sample?.html ?? (postServerMessage(prompt, html));
      resolve(html);
    }, 10000);
  });


  async function postServerMessage(goal, html):Promise<string> {
    const formData = new FormData();
    const firstTime = Boolean(!html);
    let hasImage:Boolean;
    // if ((<HTMLInputElement>imageInput).files?.length) {
    //   hasImage = true;
    //   formData.append("image", (<HTMLInputElement>imageInput).files[0]);
    // }
    formData.append("script_name", "main");
    formData.append(
      "function_call",
      getCallFunction(firstTime, goal, html, hasImage)
    );
    formData.append("id", '0');
    formData.append("message", goal);
    const response = fetch("https://web-ui-assistant-server-test-dot-desarrollo-262414.rj.r.appspot.com/run-function", { // Ver donde poner la URL como cte de config
      method: "POST",
      body: formData,
      mode: "cors"
    }).then(response => response.json())
    .then(json => processResponseData(json))
    return response;
  }

  function processResponseData(data):string {
    const html = getResponseBody(data.output.replace(/\n/g, ""));
    return html;
  }

  function getCallFunction(firstTime, goal, html, hasImage) {
    let function_call;
    if (firstTime) {
      if (hasImage)
        function_call = {
          function_name: "build_from_image",
          args: ["#IMAGE#", goal]
        };
      else function_call = { function_name: "build_goal", args: [goal] };
    } else function_call = { function_name: "fix_html", args: [goal, html] };
    return JSON.stringify(function_call);
  }

  function getResponseBody(response) {
    const regex = /<body[^>]*>([\s\S]*?)<\/body>/;
    const match = response.match(regex);
  
    if (match) {
      return match[1];
    } else {
      return response;
    }
  }