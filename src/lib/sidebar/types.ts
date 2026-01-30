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
  onPositionChange: (pos: Position) => void;
  onClick: () => void;
}

export interface PanelOptions {
  showSettings?: boolean;
  disableAnimation?: boolean;
  onClose?: () => void;
}

export interface PanelResult {
  panel: HTMLElement;
  close: () => void;
  cleanup: () => void;
}
