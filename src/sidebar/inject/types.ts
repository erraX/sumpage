export interface Position {
  right: number;
  bottom: number;
}

export interface DragHandlers {
  onDragStart: () => void;
  onDrag: (deltaX: number, deltaY: number) => void;
  onDragEnd: () => void;
}

export interface ToggleButtonHandlers {
  onClick: () => void;
}

export interface PanelOptions {
  onClose?: () => void;
}

export interface PanelResult {
  close: () => void;
  open: () => void;
}
