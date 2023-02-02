const {
  document,
  cancelAnimationFrame,
  requestAnimationFrame
} = globalThis;

export default class IncrementalText {
  #raf = 0;
  #target = null;
  constructor(target) {
    this.#target = target;
  }
  show(text) {
    cancelAnimationFrame(this.#raf);
    this.#target.textContent = '';
    const node = this.#target.appendChild(document.createTextNode(''));
    const chars = [...text];
    let i = 0;
    const show = () => {
      if (i < chars.length) {
        node.data += chars[i++];
        this.#raf = requestAnimationFrame(show);
      }
    };
    this.#raf = requestAnimationFrame(show);
  }
}
