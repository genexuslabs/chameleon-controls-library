import { ChatMessageByRoleNoId } from "./types";

export const getMessageContent = (
  message: ChatMessageByRoleNoId<"system" | "assistant">
) =>
  typeof message.content === "string"
    ? message.content
    : message.content.message;
