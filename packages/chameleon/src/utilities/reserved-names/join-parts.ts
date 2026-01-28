export const joinParts = (parts: { [key in string]: string }) =>
  Object.values(parts).join(",");
