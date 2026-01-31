import { createToggleButton } from './toggle-button';
import { createPanel } from './panel';
import { ShadowDom } from './ShadowDom';
import { injectStyle } from './dom';
import { singleton } from '../../utils/singleton';

// Prevent multiple injections
let injected = false;

export function injectSidebar() {
  if (injected) return;
  injected = true;

  const panel = singleton(createPanel);

  const buttonHost = new ShadowDom('sumpage-sidebar-button-host').mount();
  const button = createToggleButton({
    onClick: panel.get().open,
  });
  buttonHost.getShadow()?.appendChild(button.element);
  injectStyle(button.styles, buttonHost.getShadow()!);

  // Auto-open panel
  setTimeout(panel.get().open, 0);
}
