/**
 * Valid examples:
 * @example
 *   const systemMessage: GxEAIChatMessage = {
 *     role: "system",
 *     content: "A useful assistant."
 *   };
 *
 *   const assistantMessage: GxEAIChatMessage = {
 *     role: "assistant",
 *     content: "Processing with Chat with LLMs",
 *     status: "waiting"
 *   };
 *
 *   const userMessage: GxEAIChatMessage = {
 *     role: "user",
 *     content: "Hello world!"
 *   };
 *
 *   const userMessageWithImage: GxEAIChatMessage = {
 *     role: "user",
 *     content: [
 *       { type: "text", text: "Hello world!" },
 *       { type: "image_url", image_url: { url: "..." } },
 *       { type: "image_url", image_url: { url: "..." } },
 *     ]
 *   };
 */
export type ChatMessage = ChatMessageByRole<ChatMessageRole>;

export type ChatMessageByRole<T extends ChatMessageRole> = T extends "system"
  ? {
      role: "system";
      content: string;
    }
  : T extends "user"
  ? {
      role: "user";
      content: ChatUserContent;
    }
  : {
      role: "assistant";
      content: ChatAssistantContent;

      /**
       * Specifies the status of the message. If not defined, it will default
       * to "complete"
       */
      status?: "complete" | "waiting" | "streaming";
    };

export type ChatMessageRole = "system" | "user" | "assistant";

export type ChatAssistantContent = string | ChatAssistantContentFiles;

export type ChatAssistantContentFiles = {
  message: string;
  files?: ChatAssistantContentFilesFile[];
};

export type ChatAssistantContentFilesFile = {
  url: string;
  caption: string;
};

export type ChatUserContent = string | ChatContentImages;

export type ChatContentImages = [
  {
    type: "text";
    text: string;
  },
  ...ChatContentImage[]
];

export type ChatContentImage = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

export type ChatInternalCallbacks = {
  clear: () => Promise<void>;

  /**
   * Specifies a callback to execute when the user adds a new message to the
   * chat and waits a response.
   */
  sendChatToLLM: (chat: ChatMessage[]) => void;

  /**
   * Specifies a callback to execute when clicking the stop-generate-answer
   * button.
   */
  stopGeneratingAnswer?: () => Promise<void>;

  /**
   * Given the image file, it uploads the image to the server and returns the
   * URL of the public image that will be used in the user chat message.
   */
  uploadImage: (imageFile: File) => Promise<string>;
};
