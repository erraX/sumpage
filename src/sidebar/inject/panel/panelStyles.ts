export const PANEL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');
* { box-sizing: border-box; }

/* Panel structure */
.sumpage-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #f9fbfa;
  box-shadow: -6px 0 28px rgba(22, 52, 50, 0.18);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Space Grotesk', sans-serif;
}
.sumpage-panel-open { transform: translateX(0); }
`;

export const COMPONENT_STYLES = `
/* UI Component Fallback Styles */
.sumpage-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #d7e1dd;
  overflow: hidden;
}
.sumpage-card-header {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.sumpage-card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2a2a;
}
.sumpage-card-content {
  padding: 0 20px 20px;
}
.sumpage-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  height: 40px;
  padding: 0 16px;
  font-family: 'Space Grotesk', sans-serif;
}
.sumpage-button:disabled {
  pointer-events: none;
  opacity: 0.6;
}
.sumpage-button-default {
  background: #2f6f6a;
  color: white;
}
.sumpage-button-default:hover:not(:disabled) {
  background: #235652;
}
.sumpage-button-destructive {
  background: #b44635;
  color: white;
}
.sumpage-button-destructive:hover:not(:disabled) {
  background: #d45540;
}
.sumpage-input {
  flex: 1;
  height: 40px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  background: #ffffff;
  padding: 0 12px;
  font-size: 14px;
  font-family: 'Space Grotesk', sans-serif;
  color: #1f2a2a;
  box-sizing: border-box;
}
.sumpage-input:focus {
  outline: none;
  border-color: #2f6f6a;
  box-shadow: 0 0 0 3px #e3f0ee;
}
.sumpage-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #5d6b68;
  margin-bottom: 6px;
}
.sumpage-form-group {
  margin-bottom: 16px;
}
.sumpage-alert {
  position: relative;
  width: 100%;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
}
.sumpage-alert-destructive {
  background: #fff0ec;
  border: 1px solid #f2b8a8;
  color: #b44635;
}
.sumpage-alert-success {
  background: #e6f4ec;
  border: 1px solid #2f7a4f;
  color: #2f7a4f;
}
.sumpage-select {
  display: flex;
  height: 40px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  background: white;
  padding: 0 12px;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.sumpage-select:focus {
  outline: none;
  border-color: #2f6f6a;
  box-shadow: 0 0 0 3px #e3f0ee;
}
.sumpage-tabs-list {
  display: inline-flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: #e3f0ee;
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
}
.sumpage-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
  color: #5d6b68;
  font-family: 'Space Grotesk', sans-serif;
}
.sumpage-tab-active {
  background: white;
  color: #1f2a2a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.sumpage-row {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.sumpage-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.sumpage-toggle {
  background: none;
  border: none;
  color: #2f6f6a;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
}
.sumpage-toggle:hover {
  text-decoration: underline;
}
.sumpage-advanced {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #d7e1dd;
}
.sumpage-container {
  padding: 16px;
}
`;
