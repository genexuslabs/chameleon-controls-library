var dragSrcEl = null;

export function handleDragStart(e) {
  this.style.opacity = "0.4";

  dragSrcEl = this;

  e.dataTransfer.effectAllowed = "move";
}

export function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = "move";

  return false;
}

export function handleDragEnter(e) {
  this.classList.add("over");
}

export function handleDragLeave(e) {
  this.classList.remove("over");
}

export function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  console.log("dragSrcEl", dragSrcEl);
  console.log("this", this);

  if (dragSrcEl != this) {
    this.replaceWith(this, dragSrcEl);
  }

  return false;
}

export function handleDragEnd(e) {
  this.style.opacity = "1";

  for (let item of this.parentElement.children) {
    item.classList.remove("over");
  }
}
