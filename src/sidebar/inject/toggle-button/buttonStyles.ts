export const BUTTON_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
.sumpage-toggle-btn {
  position: fixed;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(47, 111, 106, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(22, 52, 50, 0.25);
  cursor: pointer;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  user-select: none;
  padding: 0;
}
.sumpage-toggle-btn:hover {
  transform: translateY(-1px);
  background: rgba(47, 111, 106, 1);
  box-shadow: 0 6px 16px rgba(22, 52, 50, 0.3);
}
.sumpage-toggle-btn:active {
  transform: translateY(0);
}
.sumpage-toggle-btn.dragging {
  cursor: grabbing;
  transform: scale(1.05);
}
.sumpage-toggle-btn svg {
  fill: none;
}
`;
