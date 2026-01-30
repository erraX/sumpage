/**
 * Class for manage shaodow DOM elements.
 */
export class ShadowDom {
  private host: HTMLElement;
  private shadow: ShadowRoot | undefined;

  constructor(
    private id: string,
    private tagName: string = 'div'
  ) {
    this.host = document.createElement(this.tagName);
    this.host.id = this.id;
  }

  getShadow() {
    return this.shadow;
  }

  mount() {
    document.body.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: 'open' });
  }

  unmount() {
    if (this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
  }
}
