export function setupOutsideClick(
  elements: (Node | null)[],
  onOutsideClick: () => void
): () => void {
  let ignoreNextClick = true;

  setTimeout(() => {
    ignoreNextClick = false;
  }, 100);

  const handler = (e: MouseEvent) => {
    if (ignoreNextClick) return;

    const target = e.target as Node;
    if (!target) return;

    // Use composedPath to properly traverse shadow DOM boundaries
    const path = e.composedPath();

    // Ignore clicks inside MUI popovers/menus (Select, Autocomplete, etc.)
    const muiOverlay = document.querySelector('.MuiPopover-root, .MuiModal-root');
    if (muiOverlay) {
      if (muiOverlay.contains(target) || path.includes(muiOverlay)) {
        return;
      }
    }

    // Also guard on generic listbox/option roles to avoid closing while interacting with dropdowns
    const pathIncludesListbox = path.some((node) => {
      if (!(node instanceof Element)) return false;
      const role = node.getAttribute('role');
      return role === 'listbox' || role === 'option' || role === 'combobox';
    });
    if (pathIncludesListbox) return;

    // Check if click is inside any of our tracked elements (handles shadow DOM via contains)
    for (const element of elements) {
      if (element) {
        // For shadow DOM elements, use contains which properly crosses shadow boundaries
        if (element.contains(target)) {
          return;
        }
        // Also check if the element is in the composed path (for portal scenarios)
        if (path.includes(element)) {
          return;
        }
      }
    }

    onOutsideClick();
  };

  document.addEventListener('click', handler);

  return () => {
    document.removeEventListener('click', handler);
  };
}
