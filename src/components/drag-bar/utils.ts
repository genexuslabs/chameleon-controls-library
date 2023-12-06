import { DragBarComponent } from "./types";

export const setSizesAndDragBarPosition = (
  components: DragBarComponent[],
  sizes: string[],
  dragBarPositions: string[]
) => {
  let frSum = 0;
  let fixedSizesSum = 0;

  // Get the sum of all fr values. Also, store the sum of fixed sizes
  components.map(comp => {
    if (comp.size.includes("fr")) {
      const frValue = Number(comp.size.replace("fr", "").trim());

      frSum += frValue;
    }
    // Pixel value
    else {
      const pxValue = Number(comp.size.replace("px", "").trim());

      fixedSizesSum += pxValue;
    }
  });

  // If there are fr values, we must adjust the frs values to be relative to 1fr
  if (frSum > 0) {
    components.map(comp => {
      if (comp.size.includes("fr")) {
        const frValue = Number(comp.size.replace("fr", "").trim());

        const adjustedFrValue = frValue / frSum;
        comp.size = `${adjustedFrValue}fr`;
      }
    });
  }

  // Update sizes array and store drag-bar position (dragBarPositions array)
  components.forEach((comp, index) => {
    sizes.push(comp.size);
    let componentSize: string;

    // If the component has fr value, take into account the sum of fixed values
    // to calculate the actual relative value
    if (comp.size.includes("fr")) {
      const frValue = Number(comp.size.replace("fr", "").trim());

      componentSize =
        fixedSizesSum === 0
          ? `${frValue * 100}%`
          : `${frValue * 100}% - (${fixedSizesSum}px * ${frValue})`;
    }
    // Pixel value
    else {
      componentSize = comp.size;
    }

    // Store each drag bar position
    const dragBarPosition =
      index === 0
        ? componentSize
        : `${dragBarPositions[index - 1]} + ${componentSize}`;

    dragBarPositions.push(dragBarPosition);
  });
};
