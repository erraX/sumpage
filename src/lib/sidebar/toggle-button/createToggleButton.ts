import type { Position, ToggleButtonHandlers } from '../types';
import { BUTTON_STYLES } from './buttonStyles';
import { setupDragging } from './dragLogic';
import { loadPosition, savePosition } from './positionStorage';

export function createToggleButton(
  container: ShadowRoot,
  handlers: ToggleButtonHandlers
): { element: HTMLButtonElement; position: Position; cleanup: () => void } {
  // Inject styles directly into container
  const style = document.createElement('style');
  style.textContent = BUTTON_STYLES;
  container.appendChild(style);

  // Create toggle button and append directly to container (shadow root)
  const button = document.createElement('button');
  button.id = 'sumpage-toggle-btn';
  button.className = 'sumpage-toggle-btn';
  button.title = 'Sumpage - Click to summarize this page';

  // SVG icon
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M6 6C4.343 6 3 7.343 3 9v6c0 1.657 1.343 3 3 3h1v2l3-2h6c1.657 0 3-1.343 3-3V9c0-1.657-1.343-3-3-3H6z'
  );
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#f9fbfa');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  button.appendChild(svg);
  container.appendChild(button);

  // Position state
  let position: Position = { right: 24, bottom: 24 };

  function clampPosition(right: number, bottom: number): Position {
    const rect = button.getBoundingClientRect();
    const maxRight = Math.max(0, window.innerWidth - rect.width);
    const maxBottom = Math.max(0, window.innerHeight - rect.height);
    return {
      right: Math.min(Math.max(0, right), maxRight),
      bottom: Math.min(Math.max(0, bottom), maxBottom),
    };
  }

  function applyPosition(right: number, bottom: number) {
    const clamped = clampPosition(right, bottom);
    position = clamped;
    button.style.right = clamped.right + 'px';
    button.style.bottom = clamped.bottom + 'px';
    return clamped;
  }

  // Initialize position
  loadPosition().then((saved) => {
    if (saved) {
      const clamped = applyPosition(saved.right, saved.bottom);
      // Save back if clamped changed
      if (clamped.right !== saved.right || clamped.bottom !== saved.bottom) {
        savePosition(clamped);
      }
    }
  });

  // Click handler
  const handleClick = () => {
    handlers.onClick();
  };
  button.addEventListener('click', handleClick);

  // Drag handlers
  const dragHandlers = {
    onDragStart: () => {},
    onDrag: (deltaX: number, deltaY: number) => {
      applyPosition(position.right - deltaX, position.bottom - deltaY);
    },
    onDragEnd: () => {
      savePosition(position);
    },
  };

  const cleanupDrag = setupDragging(button, dragHandlers);

  // Resize handler
  const handleResize = () => {
    const prevRight = position.right;
    const prevBottom = position.bottom;
    const clamped = applyPosition(prevRight, prevBottom);
    if (clamped.right !== prevRight || clamped.bottom !== prevBottom) {
      savePosition(clamped);
    }
  };
  window.addEventListener('resize', handleResize);

  return {
    element: button,
    position,
    cleanup: () => {
      button.removeEventListener('click', handleClick);
      cleanupDrag();
      window.removeEventListener('resize', handleResize);
      style.remove();
      button.remove();
    },
  };
}
