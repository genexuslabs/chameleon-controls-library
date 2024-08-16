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
                    url: "https://next.genexus.ai",
                    caption: "Mars Exploration Contract"
                  },
                  {
                    url: "https://gx-chameleon.netlify.app",
                    caption: "Venus Exploration Contract"
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
  clear: () => new Promise(resolve => resolve()),
  sendChatToLLM: sendChatToLLM,
  uploadImage: () => new Promise(resolve => resolve("")),
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
    chat: "Chat",
    clearChat: "Clear chat",
    copyResponseButton: "Copy assistant response",
    downloadCodeButton: "Download code",
    imagePicker: "Select images",
    removeUploadedImage: "Remove uploaded image",
    sendButton: "Send",
    sendInput: "Message",
    stopGeneratingAnswerButton: "Stop generating answer"
  },
  placeholder: {
    sendInput: "Ask me a question..."
  },
  text: {
    copyCodeButton: "Copy code",
    processing: `Processing with ${PROCESSING_PLACEHOLDER}`,
    sourceFiles: "Source files:"
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
