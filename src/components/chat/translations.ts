export type ChatTranslations = {
  accessibleName: {
    clearChat: string;
    copyMessageContent?: string;
    downloadCodeButton?: string;
    // retryAudioUpload?: string;
    // retryFileUpload?: string;
    // retryImageUpload?: string;
    // retryVideoUpload?: string;
    sendButton: string;
    sendInput: string;
    stopGeneratingAnswerButton?: string;
  };
  placeholder: {
    sendInput: string;
  };
  text: {
    copyCodeButton: string;
    copyMessageContent?: string;
    downloadCodeButton?: string;
    processing?: string;
    // retryAudioUpload?: string;
    // retryFileUpload?: string;
    // retryImageUpload?: string;
    // retryVideoUpload?: string;
    sourceFiles?: string;
    stopGeneratingAnswerButton?: string;
  };
};
