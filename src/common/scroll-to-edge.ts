export const scrollToEdge = (
  event: MouseEvent,
  container: HTMLElement,
  scrollSpeed: number,
  scrollThreshold: number
) => {
  const mousePositionY = event.clientY - container.getBoundingClientRect().top;

  const containerHeight = container.clientHeight;
  const mouseAtTheTop = mousePositionY <= scrollThreshold;
  const mouseAtTheBottom = mousePositionY > containerHeight - scrollThreshold;

  if (mouseAtTheTop || mouseAtTheBottom) {
    const scrollAmount = mouseAtTheTop
      ? mousePositionY - scrollThreshold
      : mousePositionY - (containerHeight - scrollThreshold);

    // Adjust container scroll position
    container.scrollTop += scrollAmount / scrollSpeed;
  }
};
