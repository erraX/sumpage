import { createToggleButton } from './toggle-button';
import { createPanel } from './panel';
import { ShadowDom } from './ShadowDom';
import { singleton } from '../../utils/singleton';

// Prevent multiple injections
let injected = false;

export function injectSidebar() {
  if (injected) return;
  injected = true;

  const button = new ShadowDom('sumpage-sidebar-button-host').mount();

  const panel = singleton(createPanel);

  createToggleButton(button.getShadow()!, {
    onPositionChange: () => {},
    onClick: panel.get().open,
  });

  // Auto-open panel on load if no provider configured
  setTimeout(panel.get().open, 0);
}
