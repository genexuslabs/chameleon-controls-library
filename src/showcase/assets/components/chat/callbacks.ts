import { ChatTranslations } from "../../../../components/chat/translations";
import { ChatCallbacks, ChatMessage } from "../../../../components/chat/types";

const PROCESSING_PLACEHOLDER = "{{ASSISTANT_NAME}}";

let timeOut: NodeJS.Timeout;

const ASSISTANT_RESPONSE_MARKDOWN = `\\begin{gather*}\n    \\iint_V mu(u,v) ,du,dv\n\\\\\n    \\iiint_V \\mu(u,v,w) \\,du\\,dv\\,dw\n\\end{gather*}\n\n\\[\n    \\oint_V f(s) \\,ds\n\\]\n\nIntegral \\(\\int_{a}^{b} x^2 \\,dx\\) inside text\n\nHello \\[ \\prod_{i=a}^{b} f(i) \\] world\n\nHello \\( \\prod_{i=a}^{b} f(i) \\) world\n\nHello $$ \\prod_{i=a}^{b} f(i) $$ world\n\nHello $ \\prod_{i=a}^{b} f(i) $ world\n\n\\textbf{Diffie-Hellman Key Exchange}\n\n\\text{The Diffie-Hellman key exchange is a method used to securely exchange cryptographic keys over a public channel.}\n\n\\textbf{Step-by-step Explanation}\n\n\\text{1. Publicly agree on a prime number } p \\text{ and a primitive root } g.\n\n\\text{2. Alice chooses a private key } a \\text{ and sends } A = g^a \\mod p \\text{ to Bob.}\n\n\\text{3. Bob chooses a private key } b \\text{ and sends } B = g^b \\mod p \\text{ to Alice.}\n\n\\text{4. Both compute the shared secret:}\n\n\\text{Shared secret} = B^a \\mod p = A^b \\mod p\n\n\\textbf{Mathematical Example}\n\n\\begin{aligned}\np &= 23 \\\\\ng &= 5 \\\\\na &= 6 \\quad (\\text{Alice's private key}) \\\\\nb &= 15 \\quad (\\text{Bob's private key}) \\\\\nA &= 5^6 \\mod 23 = 8 \\\\\nB &= 5^{15} \\mod 23 = 2 \\\\\ns &= B^a \\mod p = 2^6 \\mod 23 = 18 \\\\\n  &= A^b \\mod p = 8^{15} \\mod 23 = 18\n\\end{aligned}\n\n\\text{Thus, both share the secret key } s = 18.\n
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

const getChatRef = () =>
  document
    .querySelector("ch-flexible-layout-render")!
    .shadowRoot.querySelector("ch-flexible-layout-render")!
    .shadowRoot.querySelector("ch-chat");

const sendChatMessages = () => {
  // This is a WA to get the chat reference
  const chatRef = getChatRef();

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
  stopResponse: () => {
    clearTimeout(timeOut);

    // This is a WA to get the chat reference
    const chatRef = getChatRef();

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
    stopResponseButton: "Stop generating answer"
  },
  placeholder: {
    sendInput: "Ask me a question..."
  },
  text: {
    copyCodeButton: "Copy code",
    copyMessageContent: "Copy",
    downloadCodeButton: "Download",
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
