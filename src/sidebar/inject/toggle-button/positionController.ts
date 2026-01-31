import type { Position, ToggleButtonHandlers } from "../types";
import { loadPosition, savePosition } from "./positionStorage";

type PositionController = {
  getPosition: () => Position;
  init: () => void;
  handleClick: () => void;
};

type PositionControllerOptions = {
  handlers: ToggleButtonHandlers;
  applyPosition: (right: number, bottom: number) => Position;
  attachDragging: (dragHandlers: {
    onDragStart: () => void;
    onDrag: (deltaX: number, deltaY: number) => void;
    onDragEnd: () => void;
  }) => void;
};

export function createPositionController(
  options: PositionControllerOptions
): PositionController {
  let position: Position = { right: 24, bottom: 24 };

  const applyPosition = (right: number, bottom: number) => {
    position = options.applyPosition(right, bottom);
    return position;
  };

  const init = () => {
    loadPosition().then((saved) => {
      if (!saved) return;
      const updated = applyPosition(saved.right, saved.bottom);
      // Save back if clamped changed
      if (updated.right !== saved.right || updated.bottom !== saved.bottom) {
        savePosition(updated);
      }
    });
  };

  // Track drag state to suppress click triggered after dragging
  let startPosition: Position = { ...position };
  let hasDragged = false;

  const handleClick = () => {
    if (hasDragged) return;
    options.handlers.onClick();
  };

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

  options.attachDragging(dragHandlers);

  return {
    getPosition: () => position,
    init,
    handleClick,
  };
}
