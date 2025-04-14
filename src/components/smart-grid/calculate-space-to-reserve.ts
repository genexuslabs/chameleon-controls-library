export const calculateSpaceToReserve = (
  smartGridRef: HTMLChSmartGridElement,
  anchorCellRef: HTMLChSmartGridCellElement,
  lastCellRef: HTMLChSmartGridCellElement
): number => {
  // const smartGridContent = smartGridRef.querySelector(
  //   ":scope > [slot='grid-content']"
  // );

  // TODO: Take into account the padding-block and border sizes

  if (anchorCellRef === lastCellRef) {
    return smartGridRef.clientHeight;
  }

  const distanceFromTheAnchorCellToTheLastCell =
    lastCellRef.offsetTop - anchorCellRef.offsetTop;

  return smartGridRef.clientHeight - distanceFromTheAnchorCellToTheLastCell;
};
