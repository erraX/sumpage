import type { Position, ToggleButtonHandlers } from '../types';
import { BUTTON_STYLES } from './buttonStyles';
import { setupDragging } from './dragLogic';
import { loadPosition, savePosition } from './positionStorage';
import { createElement, buildToggleButtonIcon } from '../dom';

const DEFAULT_POSITION: Position = { right: 24, bottom: 24 };
const DRAG_CLICK_SLOP_PX = 5;

interface PositionController {
  init: () => void;
  dragHandlers: {
    onDragStart: () => void;
    onDrag: (deltaX: number, deltaY: number) => void;
    onDragEnd: () => void;
  };
  handleClick: () => void;
  getPosition: () => Position;
}

function createButtonPositionController(
  button: HTMLButtonElement,
  handlers: ToggleButtonHandlers
): PositionController {
  let position: Position = { ...DEFAULT_POSITION };
  let dragOrigin: Position | null = null;
  let accumulatedDelta = { x: 0, y: 0 };
  let suppressClick = false;

  const clampToViewport = (pos: Position): Position => {
    const rect = button.getBoundingClientRect();
    const maxRight = Math.max(window.innerWidth - rect.width, 0);
    const maxBottom = Math.max(window.innerHeight - rect.height, 0);

    return {
      right: Math.min(Math.max(pos.right, 0), maxRight),
      bottom: Math.min(Math.max(pos.bottom, 0), maxBottom),
    };
  };

  const applyPosition = (
    next: Position,
    options: { persist?: boolean } = {}
  ): Position => {
    const { persist = false } = options;
    const clamped = clampToViewport(next);

    position = clamped;
    button.style.right = clamped.right + 'px';
    button.style.bottom = clamped.bottom + 'px';

    if (persist) {
      savePosition(clamped);
    }

    return clamped;
  };

  const resetDragTracking = () => {
    dragOrigin = null;
    accumulatedDelta = { x: 0, y: 0 };
  };

  const init = () => {
    // Apply default position immediately so the button renders bottom-right.
    applyPosition(position);

    // Initialize position from storage.
    loadPosition().then((saved) => {
      if (!saved) return;
      const applied = applyPosition(saved);
      if (applied.right !== saved.right || applied.bottom !== saved.bottom) {
        savePosition(applied);
      }
    });
  };

  const dragHandlers = {
    onDragStart: () => {
      dragOrigin = { ...position };
      accumulatedDelta = { x: 0, y: 0 };
      suppressClick = false;
    },
    onDrag: (deltaX: number, deltaY: number) => {
      accumulatedDelta = {
        x: accumulatedDelta.x + deltaX,
        y: accumulatedDelta.y + deltaY,
      };

      applyPosition({
        right: position.right - deltaX,
        bottom: position.bottom - deltaY,
      });

      if (
        !suppressClick &&
        (Math.abs(accumulatedDelta.x) > DRAG_CLICK_SLOP_PX ||
          Math.abs(accumulatedDelta.y) > DRAG_CLICK_SLOP_PX)
      ) {
        suppressClick = true;
      }
    },
    onDragEnd: () => {
      if (!dragOrigin) {
        resetDragTracking();
        return;
      }

      const movedEnough = suppressClick;
      const finalPosition = movedEnough ? position : dragOrigin;

      applyPosition(finalPosition, {
        persist: movedEnough,
      });

      if (movedEnough) {
        // Keep click suppressed for the current gesture.
        setTimeout(() => {
          suppressClick = false;
        }, 0);
      } else {
        suppressClick = false;
      }

      resetDragTracking();
    },
  };

  const handleClick = () => {
    if (suppressClick) return;
    handlers.onClick();
  };

  return {
    init,
    dragHandlers,
    handleClick,
    getPosition: () => position,
  };
}

export function createToggleButton(handlers: ToggleButtonHandlers) {
  const button = createElement<HTMLButtonElement>('button', {
    id: 'sumpage-toggle-btn',
    className: 'sumpage-toggle-btn',
    title: 'Sumpage - Click to summarize this page',
  });
  button.appendChild(buildToggleButtonIcon());

  const positionController = createButtonPositionController(button, handlers);
  button.addEventListener('click', positionController.handleClick);
  setupDragging(button, positionController.dragHandlers);
  positionController.init();

  return {
    element: button,
    styles: BUTTON_STYLES,
    position: positionController.getPosition(),
  };
}
