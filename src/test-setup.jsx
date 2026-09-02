import '@testing-library/jest-dom/vitest'

// jsdom has no layout — give Recharts a real size so <ResponsiveContainer> renders.
const W = 800
const H = 400

global.ResizeObserver = class {
  constructor(cb) { this.cb = cb }
  observe(el) { this.cb([{ target: el, contentRect: { width: W, height: H } }]) }
  unobserve() {}
  disconnect() {}
}

for (const [prop, val] of [['offsetWidth', W], ['offsetHeight', H], ['clientWidth', W], ['clientHeight', H]]) {
  Object.defineProperty(window.HTMLElement.prototype, prop, { configurable: true, value: val })
}
window.HTMLElement.prototype.getBoundingClientRect = () => ({ width: W, height: H, top: 0, left: 0, right: W, bottom: H, x: 0, y: 0 })

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    // disable chart animations in tests so paths render synchronously
    matches: /prefers-reduced-motion/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
