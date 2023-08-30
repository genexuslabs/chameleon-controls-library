export function makeDraggable(item: HTMLElement) {
  /* 
  let initialX = 0;
  let initialY = 0;
  let currentX = 0;
  let currentY = 0;

  let needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  // Función para iniciar el arrastre
  function dragStart(e) {
    console.log("dragStart");
    initialX = e.clientX;
    initialY = e.clientY;
    currentX = initialX;
    currentY = initialY;

    // Agregamos un efecto visual de sombra para indicar que se está arrastrando
    item.style.opacity = "0.1";
  }

  // Función para realizar el arrastre
  function drag(e) {
    e.preventDefault();

    if (!needForRAF) {
      return;
    }
    needForRAF = false; // No need to call RAF up until next frame

    console.log("drag");

    requestAnimationFrame(() => {
      needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      // Calculamos la diferencia entre la posición actual del mouse y la inicial
      const deltaX = e.clientX - currentX;
      const deltaY = e.clientY - currentY;

      // Actualizamos la posición del elemento
      const rect = item.getBoundingClientRect();
      item.style.left = `${rect.left + deltaX}px`;
      item.style.top = `${rect.top + deltaY}px`;

      // Actualizamos la posición actual del mouse
      currentX = e.clientX;
      currentY = e.clientY;
    });
  }

  const dragEnd = () => {
    item.style.opacity = null;
  };

  console.log("Holaaa");

  // Agregamos los eventos necesarios al elemento para gestionar el arrastre
  item.addEventListener("dragstart", dragStart);
  item.addEventListener("drag", drag);
  item.addEventListener("dragend", dragEnd);
  */
}
