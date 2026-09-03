import { useSyncExternalStore } from 'react'

const listeners = new Set()
function emit() { listeners.forEach((l) => l()) }
if (typeof window !== 'undefined') window.addEventListener('hashchange', emit)

function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) }
function snapshot() { return (typeof window !== 'undefined' && window.location.hash) || '#/' }

export function parseHash(hash) {
  const raw = (hash || '#/').replace(/^#/, '')
  const qi = raw.indexOf('?')
  const pathRaw = qi === -1 ? raw : raw.slice(0, qi)
  const qs = qi === -1 ? '' : raw.slice(qi + 1)
  const trimmed = pathRaw.replace(/^\/+|\/+$/g, '')
  return { path: trimmed ? '/' + trimmed : '/', query: new URLSearchParams(qs) }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot, () => '#/')
  const { path, query } = parseHash(hash)
  const navigate = (to) => {
    window.location.hash = to.startsWith('#') ? to : '#' + to
    emit() // jsdom fires hashchange async; notify subscribers now
  }
  return { path, query, navigate }
}

export function Route({ path, children }) {
  const { path: current } = useRoute()
  return current === path ? children : null
}

export function RouteLink({ to, children, ...rest }) {
  const { path } = useRoute()
  const target = to.replace(/^#/, '')
  return (
    <a href={'#' + target} aria-current={path === target ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
}
