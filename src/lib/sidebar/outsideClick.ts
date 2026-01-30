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

    // Use composedPath to properly traverse shadow DOM boundaries
    const path = e.composedPath();

    // Ignore clicks inside Radix Select portals (to prevent closing panel when opening selects)
    const pathIncludesRadixSelect = path.some((node) => {
      if (!(node instanceof Element)) return false;
      const attrNames = node.getAttributeNames();
      if (attrNames.some((name) => name.startsWith('data-radix-select'))) {
        return true;
      }
      // Also guard on common roles Radix applies to content/viewport/items
      const role = node.getAttribute('role');
      return role === 'listbox' || role === 'option' || role === 'combobox';
    });
    if (pathIncludesRadixSelect) return;

    // Check if any element in the path is one of our tracked elements
    for (const element of elements) {
      if (element && path.includes(element)) {
        return;
      }
    }

    onOutsideClick();
  };

  document.addEventListener('click', handler);

  return () => {
    document.removeEventListener('click', handler);
  };
}
