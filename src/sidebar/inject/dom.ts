export const injectStyle = (
  styleText: string,
  parent: HTMLElement | ShadowRoot
) => {
  const style = document.createElement('style');
  style.textContent = styleText;
  parent.appendChild(style);
  return style;
};

export const createElement = <E extends HTMLElement>(
  tagName: string,
  props: Partial<HTMLElement>,
  parent?: HTMLElement | ShadowRoot
) => {
  const element = document.createElement(tagName);
  Object.assign(element, props);
  if (parent) {
    parent.appendChild(element);
  }
  return element as E;
};

export const buildToggleButtonIcon = () => {
  // SVG icon
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute(
    'd',
    'M6 6C4.343 6 3 7.343 3 9v6c0 1.657 1.343 3 3 3h1v2l3-2h6c1.657 0 3-1.343 3-3V9c0-1.657-1.343-3-3-3H6z'
  );
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#f9fbfa');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  return svg;
};
