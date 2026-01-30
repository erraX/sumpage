import type { DragHandlers } from '../types';

export function setupDragging(
  element: HTMLElement,
  handlers: DragHandlers
): () => void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    handlers.onDragStart();
    element.classList.add('dragging');
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    handlers.onDrag(deltaX, deltaY);
    startX = e.clientX;
    startY = e.clientY;
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      element.classList.remove('dragging');
      handlers.onDragEnd();
    }
  };

  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  return () => {
    element.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
}
