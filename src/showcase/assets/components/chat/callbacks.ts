import {
  ChatInternalCallbacks,
  ChatMessage
} from "../../../../components/chat/types";
import { ChatTranslations } from "../../../../components/chat/translations";

const PROCESSING_PLACEHOLDER = "{{ASSISTANT_NAME}}";

let timeOut: NodeJS.Timeout;

const ASSISTANT_RESPONSE_MARKDOWN = `
### Code block {#code-block}
To create code blocks, you’ll use three backticks (\` \`\`\` \`) or three tildes (\`~~~\`) on the lines before and after the code block.

\`\`\`
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`

Another way to create code blocks is to indent every line of the block by at least four spaces or one tab.

    <html>
      <head>
      </head>
    </html>


#### Syntax Highlighting {#syntax-highlighting}
This feature allows you to add color highlighting for whatever language your code was written in.
To add syntax highlighting, specify a language next to the backticks before the fenced code block.

\`\`\`json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`

\`\`\`javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

const markdown = \`
# Your markdown here
\`

ReactDOM.render(
  <Markdown rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>,
  document.querySelector('#content')
)
\`\`\`

### Horizontal Rules {#horizontal-rules}
To create a horizontal rule, use three or more asterisks (\`***\`), dashes (\`---\`), or underscores (\`___\`) on a line by themselves.
`;

const ASSISTANT_RESPONSE_SHORT_MARKDOWN = `
### Code block {#code-block}
To create code blocks, you’ll use three backticks (\` \`\`\` \`) or three tildes (\`~~~\`) on the lines before and after the code block.

\`\`\`json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`
`;

const sendChatToLLM = () => {
  // This is a WA to get the chat reference
  const chatRef = document.querySelector("ch-chat") as HTMLChChatElement;

  chatRef.addNewMessage({
    id: `${new Date().getTime()}`,
    role: "assistant",
    content: "Analyzing",
    status: "waiting"
  });

  timeOut = setTimeout(() => {
    chatRef.updateLastMessage(
      {
        role: "assistant",
        content: "Processing with Chat with LLMs",
        status: "waiting"
      },
      "replace"
    );

    timeOut = setTimeout(() => {
      dummyStreaming(chatRef, 20, ASSISTANT_RESPONSE_MARKDOWN, "replace");
    }, 200);
  }, 200);
};

function dummyStreaming(
  chatRef: HTMLChChatElement,
  counter: number,
  stringToDisplay: string,
  mode: "concat" | "replace"
) {
  timeOut = setTimeout(
    () => {
      const streamingCompleted = counter >= stringToDisplay.length;

      chatRef.updateLastMessage(
        {
          role: "assistant",
          content: {
            message: stringToDisplay.substring(counter - 20, counter),
            files: streamingCompleted
              ? [
                  {
                    caption: "Mars Exploration Contract",
                    url: "https://next.genexus.ai",
                    mimeType: "text/html"
                  },
                  {
                    caption: "Venus Exploration Contract",
                    url: "https://gx-chameleon.netlify.app",
                    mimeType: "text/html"
                  }
                ]
              : undefined
          },
          status: streamingCompleted ? "complete" : "streaming"
        },
        mode
      );

      if (!streamingCompleted) {
        dummyStreaming(chatRef, counter + 20, stringToDisplay, "concat");
      }
    },
    counter % 200 === 0 ? 50 : 40
  );
}

export const chatCallbacks: ChatInternalCallbacks = {
  loadMoreItems: () =>
    new Promise(resolve =>
      setTimeout(() => {
        resolve({ items: [], morePages: false });
      }, 250)
    ),
  sendChat: sendChatToLLM,
  uploadFile: (file: File) => {
    const fileSrc = URL.createObjectURL(file);

    setTimeout(() => {
      URL.revokeObjectURL(fileSrc); // Avoid memory leaks in the mock
    }, 4500);

    return new Promise(
      resolve =>
        setTimeout(
          () =>
            resolve({
              caption: `${Math.random() * 1000}-${file.name}`,
              url: fileSrc
            }),
          2500 + (file.size % 1000)
        ) // (imageFile.size % 1000) is a dummy way to make the upload time "more real"
    );
  },
  stopGeneratingAnswer: () => {
    clearTimeout(timeOut);

    // This is a WA to get the chat reference
    const chatRef = document.querySelector("ch-chat") as HTMLChChatElement;

    chatRef.updateLastMessage(
      {
        role: "assistant",
        content: "",
        status: "complete"
      },
      "concat"
    );

    return new Promise(resolve => setTimeout(() => resolve, 10));
  }
};

export const chatTranslations: ChatTranslations = {
  accessibleName: {
    audioPicker: "Select audios",
    clearConversation: "Clear conversation",
    copyResponseButton: "Copy assistant response",
    downloadCodeButton: "Download code",
    filePicker: "Select files",
    imagePicker: "Select images",
    regenerateAnswerButton: "Regenerate Answer",
    removeUploadedAudio: "Remove uploaded audio",
    removeUploadedFile: "Remove uploaded file",
    removeUploadedImage: "Remove uploaded image",
    removeUploadedVideo: "Remove uploaded video",
    sendButton: "Send",
    sendInput: "Message",
    stopGeneratingAnswerButton: "Stop generating answer",
    videoPicker: "Select videos"
  },
  placeholder: {
    sendInput: "Ask me a question..."
  },
  text: {
    audio: "Audio",
    copyCodeButton: "Copy code",
    file: "File",
    image: "Image",
    page: "Page",
    processing: `Processing with ${PROCESSING_PLACEHOLDER}`,
    sourceFiles: "Source files:",
    video: "Video"
  }
};

export const chatRecord: ChatMessage[] = [
  { id: "1", role: "user", content: "Hello world" },
  { id: "2", role: "assistant", content: ASSISTANT_RESPONSE_MARKDOWN },
  { id: "3", role: "user", content: "Hello world 1" },
  { id: "4", role: "assistant", content: ASSISTANT_RESPONSE_SHORT_MARKDOWN },
  { id: "5", role: "user", content: "Hello world 2" },
  { id: "6", role: "assistant", content: ASSISTANT_RESPONSE_SHORT_MARKDOWN },
  { id: "7", role: "user", content: "Hello world 3" },
  { id: "8", role: "assistant", content: ASSISTANT_RESPONSE_SHORT_MARKDOWN },
  { id: "9", role: "user", content: "Hello world 4" },
  { id: "10", role: "assistant", content: ASSISTANT_RESPONSE_SHORT_MARKDOWN }
];

export const longChatRecord: ChatMessage[] = Array.from(
  { length: 40 },
  (_, index) =>
    index % 2 === 0
      ? {
          id: `index: ${index}`,
          role: "user",
          content:
            `index: ${index}` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n`
        }
      : {
          id: `index: ${index}`,
          role: "assistant",
          content:
            ASSISTANT_RESPONSE_SHORT_MARKDOWN +
            `\nindex: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n` +
            `index: ${index}\n`
        }
);

export const codeFixerRecord: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Please give me an example about...",
    metadata: "14:55"
  },
  {
    id: "2",
    role: "assistant",
    status: "complete",
    content:
      "Action required example. Action required example. Action required example.",
    metadata: "14:56"
  },
  {
    id: "3",
    role: "assistant",
    status: "complete",
    content: "Warning in request",
    metadata: "14:57",
    parts: "warning"
  },
  {
    id: "4",
    role: "error",
    content: "Error in Request",
    metadata: "14:58"
  },
  {
    id: "5",
    role: "assistant",
    status: "complete",
    content: "Warning in request",
    metadata: "14:59",
    parts: "success"
  },
  {
    id: "6",
    role: "user",
    content:
      "Implement the function calculate_average_grade in grades.py that takes a list of grades as input and returns the average grade as a floating-point number",
    metadata: "15:00"
  },
  {
    id: "7",
    role: "assistant",
    status: "complete",
    content:
      "You can provide further details or updates regarding your support ticket and its associated code. Your input here helps us better understand and address your issue effectively.",
    metadata: "15:01"
  },
  {
    id: "8",
    role: "assistant",
    status: "waiting",
    content: "Processing Request"
  },
  {
    id: "9",
    role: "assistant",
    status: "complete",
    content: ASSISTANT_RESPONSE_SHORT_MARKDOWN
  }
];
