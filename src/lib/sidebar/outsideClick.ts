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
