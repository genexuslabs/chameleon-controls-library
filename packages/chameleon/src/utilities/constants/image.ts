import { formatImagePath } from "../multi-state-icons";

export const DEFAULT_IMAGE_GET_IMAGE_PATH_CALLBACK = (
  image: string | unknown | undefined
) => (typeof image === "string" ? { base: formatImagePath(image) } : undefined);
