export const getElementInternalsLabel = (
  labels: NodeList | null
): string | undefined => {
  if (!labels || labels.length === 0) {
    return undefined;
  }

  const firstNonEmptyLabel = [...labels].find(
    label => (label.textContent ?? "").trim() !== ""
  );

  // Use the first label that is not empty
  return firstNonEmptyLabel
    ? firstNonEmptyLabel.textContent!.trim()
    : undefined;
};
