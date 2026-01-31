import type { Position, ToggleButtonHandlers } from "../types";
import { BUTTON_STYLES } from "./buttonStyles";
import { setupDragging } from "./dragLogic";
import { loadPosition, savePosition } from "./positionStorage";
import {
  injectStyle,
  createElement,
  buildToggleButtonIcon,
} from "../dom";

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
    options: { persist?: boolean; notify?: boolean; forceNotify?: boolean } = {}
  ): Position => {
    const { persist = false, notify = true, forceNotify = false } = options;
    const clamped = clampToViewport(next);
    const changed =
      clamped.right !== position.right || clamped.bottom !== position.bottom;

    position = clamped;
    button.style.right = clamped.right + 'px';
    button.style.bottom = clamped.bottom + 'px';

    if (notify && (changed || forceNotify)) {
      handlers.onPositionChange(clamped);
    }
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
    applyPosition(position, { notify: false });

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

      applyPosition(
        {
          right: position.right - deltaX,
          bottom: position.bottom - deltaY,
        },
        { notify: false }
      );

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
        forceNotify: movedEnough,
        notify: true,
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

  const positionController = createButtonPositionController(button, handlers);

  button.addEventListener('click', positionController.handleClick);
  setupDragging(button, positionController.dragHandlers);
  positionController.init();

  return {
    element: button,
    position: positionController.getPosition(),
  };
}
