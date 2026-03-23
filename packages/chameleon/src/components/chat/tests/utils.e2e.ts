import type { SmartGridDataState } from "../../smart-grid/internal/infinite-scroll/types";
import type { ChatMessage } from "../types";

export const LONG_STRING =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione eveniet error temporibus officia, facilis ducimus doloremque. Odit, vel reiciendis nihil dicta officiis facere itaque necessitatibus molestias incidunt perferendis ea eos?";

export const EMPTY_ITEMS = [];
export const ONE_ITEM: ChatMessage[] = [
  { id: "1", role: "assistant", content: "1" }
];
export const TEN_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING }
];

export const FIFTEEN_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING }
];

export const TWENTY_ITEMS = [
  { id: "1", role: "assistant", content: "Content 1" + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING },
  { id: "16", role: "error", content: "Content 16" + LONG_STRING },
  { id: "17", role: "system", content: "Content 17" + LONG_STRING },
  { id: "18", role: "user", content: "Content 18" + LONG_STRING },
  { id: "19", role: "assistant", content: "Content 19" + LONG_STRING },
  { id: "20", role: "assistant", content: "Content 20" + LONG_STRING }
] as const satisfies ChatMessage[];

export const TWENTY_FIVE_ITEMS: ChatMessage[] = [
  { id: "1", role: "assistant", content: "Content 1" + LONG_STRING },
  { id: "2", role: "error", content: "Content 2" + LONG_STRING },
  { id: "3", role: "system", content: "Content 3" + LONG_STRING },
  { id: "4", role: "user", content: "Content 4" + LONG_STRING },
  { id: "5", role: "assistant", content: "Content 5" + LONG_STRING },
  { id: "6", role: "error", content: "Content 6" + LONG_STRING },
  { id: "7", role: "system", content: "Content 7" + LONG_STRING },
  { id: "8", role: "user", content: "Content 8" + LONG_STRING },
  { id: "9", role: "assistant", content: "Content 9" + LONG_STRING },
  { id: "10", role: "error", content: "Content 10" + LONG_STRING },
  { id: "11", role: "assistant", content: "Content 1 " + LONG_STRING },
  { id: "12", role: "error", content: "Content 12" + LONG_STRING },
  { id: "13", role: "system", content: "Content 13" + LONG_STRING },
  { id: "14", role: "user", content: "Content 14" + LONG_STRING },
  { id: "15", role: "assistant", content: "Content 15" + LONG_STRING },
  { id: "16", role: "error", content: "Content 16" + LONG_STRING },
  { id: "17", role: "system", content: "Content 17" + LONG_STRING },
  { id: "18", role: "user", content: "Content 18" + LONG_STRING },
  { id: "19", role: "assistant", content: "Content 19" + LONG_STRING },
  { id: "20", role: "error", content: "Content 20" + LONG_STRING },
  { id: "21", role: "system", content: "Content 21" + LONG_STRING },
  { id: "22", role: "user", content: "Content 22" + LONG_STRING },
  { id: "23", role: "assistant", content: "Content 23" + LONG_STRING },
  { id: "24", role: "error", content: "Content 24" + LONG_STRING },
  { id: "25", role: "system", content: "Content 25" + LONG_STRING }
];

export const LOADING_STATE_VALUES: SmartGridDataState[] = [
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];
