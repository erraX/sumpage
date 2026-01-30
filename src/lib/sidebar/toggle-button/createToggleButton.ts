import type { Position, ToggleButtonHandlers } from '../types';
import { BUTTON_STYLES } from './buttonStyles';
import { setupDragging } from './dragLogic';
import { loadPosition, savePosition } from './positionStorage';
import {
  injectStyle,
  createElement,
  buildToggleButtonIcon,
} from '../../../inject/dom';

export function createToggleButton(
  container: ShadowRoot,
  handlers: ToggleButtonHandlers
): { element: HTMLButtonElement; position: Position } {
  // toggle button styles
  injectStyle(BUTTON_STYLES, container);

  // toggle button
  const button = createElement<HTMLButtonElement>(
    'button',
    {
      id: 'sumpage-toggle-btn',
      className: 'sumpage-toggle-btn',
      title: 'Sumpage - Click to summarize this page',
    },
    container
  );

  button.appendChild(buildToggleButtonIcon());

  // Position state
  let position: Position = { right: 24, bottom: 24 };

  function applyPosition(right: number, bottom: number) {
    position = { right, bottom };
    button.style.right = right + 'px';
    button.style.bottom = bottom + 'px';
    return position;
  }

  // Initialize position
  loadPosition().then((saved) => {
    if (saved) {
      const position = applyPosition(saved.right, saved.bottom);
      // Save back if clamped changed
      if (position.right !== saved.right || position.bottom !== saved.bottom) {
        savePosition(position);
      }
    }
  });

  // Track drag state to suppress click triggered after dragging
  let startPosition: Position = { ...position };
  let hasDragged = false;

  // Click handler
  const handleClick = () => {
    if (hasDragged) return;
    handlers.onClick();
  };
  button.addEventListener('click', handleClick);

  // Drag handlers
  const dragHandlers = {
    onDragStart: () => {
      startPosition = { ...position };
      hasDragged = true;
    },
    onDrag: (deltaX: number, deltaY: number) => {
      applyPosition(position.right - deltaX, position.bottom - deltaY);
    },
    onDragEnd: () => {
      savePosition(position);
      if (
        Math.abs(startPosition.right - position.right) <= 5 &&
        Math.abs(startPosition.bottom - position.bottom) <= 5
      ) {
        // Considered a click if moved less than 5px
        hasDragged = false;
      }
      if (hasDragged) {
        setTimeout(() => {
          hasDragged = false;
        }, 0);
      }
    },
  };

  setupDragging(button, dragHandlers);

  return {
    element: button,
    position,
  };
}
