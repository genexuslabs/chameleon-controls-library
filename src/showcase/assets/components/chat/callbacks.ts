import { ChatTranslations } from "../../../../components/chat/translations";
import { ChatCallbacks, ChatMessage } from "../../../../components/chat/types";

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

const sendChatMessages = () => {
  // This is a WA to get the chat reference
  const chatRef = document
    .querySelector("ch-flexible-layout-render")!
    .shadowRoot.querySelector("ch-flexible-layout-render")!
    .shadowRoot.querySelector("ch-chat");

  setTimeout(() => {
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
  }, 500);
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
          content: stringToDisplay.substring(counter - 20, counter),

          // {
          //   message: stringToDisplay.substring(counter - 20, counter),
          //   files: streamingCompleted
          //     ? [
          //         {
          //           url: "https://next.genexus.ai",
          //           caption: "Mars Exploration Contract"
          //         },
          //         {
          //           url: "https://gx-chameleon.netlify.app",
          //           caption: "Venus Exploration Contract"
          //         }
          //       ]
          //     : undefined
          // },
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

// let returnFiles = true;

export const chatCallbacks: ChatCallbacks = {
  // getChatMessageFiles: () => {
  //   returnFiles = !returnFiles;

  //   return returnFiles ? [] : [];
  // },
  sendChatMessages,
  stop: () => {
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
    clearChat: "Clear chat",
    copyMessageContent: "Copy message content",
    downloadCodeButton: "Download code",
    sendButton: "Send",
    sendInput: "Message",
    stopButton: "Stop generating answer"
  },
  placeholder: {
    sendInput: "Ask me a question..."
  },
  text: {
    copyCodeButton: "Copy code",
    copyMessageContent: "Copy",
    downloadCodeButton: "Download",
    processing: `Processing with ${PROCESSING_PLACEHOLDER}`,
    sourceFiles: "Source files:",
    stopButton: "Stop generating answer"
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
    content: {
      message: ASSISTANT_RESPONSE_SHORT_MARKDOWN,
      files: [
        {
          mimeType: "image/png",
          url: "https://www.genexus.com/media/images/logo_genexus_desktop_2024.png?timestamp=20241113105731"
        },
        {
          mimeType: "video/mp4",
          url: "https://www.w3schools.com/tags/movie.mp4"
        },
        {
          mimeType: "audio/mpeg",
          url: "https://www.w3schools.com/html/horse.ogg"
        },
        {
          caption: "Chameleon",
          mimeType: "text/plain",
          url: "https://github.com/genexuslabs/chameleon-controls-library"
        }
      ],
      sources: [
        {
          caption: "Chameleon",
          url: "https://github.com/genexuslabs/chameleon-controls-library"
        },
        {
          caption: "GeneXus",
          url: "www.genexus.com",
          parts: "genexus"
        }
      ]
    }
  }
];
