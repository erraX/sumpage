import type { Position, ToggleButtonHandlers } from '../types';
import { BUTTON_STYLES } from './buttonStyles';
import { setupDragging } from './dragLogic';
import { loadPosition, savePosition } from './positionStorage';
import { createElement, buildToggleButtonIcon } from '../dom';

const DEFAULT_POSITION: Position = { right: 24, bottom: 24 };
const DRAG_CLICK_SLOP_PX = 5;

type Viewport = { width: number; height: number };

interface PositionControllerOptions {
  defaultPosition?: Position;
  dragClickSlopPx?: number;
  getViewport?: () => Viewport;
  readPosition?: () => Promise<Position | null>;
  writePosition?: (pos: Position) => void;
}

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
  handlers: ToggleButtonHandlers,
  options: PositionControllerOptions = {}
): PositionController {
  const {
    defaultPosition = DEFAULT_POSITION,
    dragClickSlopPx = DRAG_CLICK_SLOP_PX,
    getViewport = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    readPosition = loadPosition,
    writePosition = savePosition,
  } = options;

  let position: Position = { ...defaultPosition };
  let dragOrigin: Position | null = null;
  let accumulatedDelta = { x: 0, y: 0 };
  let suppressClick = false;

  const renderPosition = (pos: Position) => {
    button.style.right = pos.right + 'px';
    button.style.bottom = pos.bottom + 'px';
  };

  const clampToViewport = (pos: Position): Position => {
    const rect = button.getBoundingClientRect();
    const { width, height } = getViewport();
    const maxRight = Math.max(width - rect.width, 0);
    const maxBottom = Math.max(height - rect.height, 0);

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
    renderPosition(clamped);

    if (persist) {
      writePosition(clamped);
    }

    return clamped;
  };

  const handleResize = () => {
    const prev = position;
    const clamped = clampToViewport(prev);
    if (clamped.right === prev.right && clamped.bottom === prev.bottom) return;
    position = clamped;
    renderPosition(clamped);
    writePosition(clamped);
  };

  const resetDragTracking = () => {
    dragOrigin = null;
    accumulatedDelta = { x: 0, y: 0 };
  };

  const init = () => {
    // Apply default position immediately so the button renders bottom-right.
    applyPosition(position);

    // Initialize position from storage.
    readPosition().then((saved) => {
      if (!saved) return;
      const applied = applyPosition(saved);
      if (applied.right !== saved.right || applied.bottom !== saved.bottom) {
        writePosition(applied);
      }
    });

    // Keep button in viewport on resize
    window.addEventListener('resize', handleResize);
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
        (Math.abs(accumulatedDelta.x) > dragClickSlopPx ||
          Math.abs(accumulatedDelta.y) > dragClickSlopPx)
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

export function createToggleButton(
  handlers: ToggleButtonHandlers,
  options?: PositionControllerOptions
) {
  const button = createElement<HTMLButtonElement>('button', {
    id: 'sumpage-toggle-btn',
    className: 'sumpage-toggle-btn',
    title: 'Sumpage - Click to summarize this page',
  });
  button.appendChild(buildToggleButtonIcon());

  const positionController = createButtonPositionController(
    button,
    handlers,
    options
  );
  positionController.init();
  button.addEventListener('click', positionController.handleClick);
  setupDragging(button, positionController.dragHandlers);

  return {
    element: button,
    styles: BUTTON_STYLES,
    position: positionController.getPosition(),
  };
}

export type { PositionControllerOptions };
