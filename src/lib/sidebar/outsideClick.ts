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

    // Ignore clicks inside Radix Select portals (to prevent closing panel when opening selects)
    const pathIncludesRadixSelect = path.some((node) => {
      if (!(node instanceof Element)) return false;
      const attrNames = node.getAttributeNames();
      if (attrNames.some((name) => name.startsWith('data-radix'))) {
        return true;
      }
      // Also guard on common roles Radix applies to content/viewport/items
      const role = node.getAttribute('role');
      return role === 'listbox' || role === 'option' || role === 'combobox';
    });
    if (pathIncludesRadixSelect) return;

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
