import { useSyncExternalStore } from 'react'
import { dishByName, SERVICE } from './menu-data'

// «Собрать дасторкан»: выбор блюд живёт в localStorage этого браузера, без регистрации.
const KEY = 'nakta-dastorkan'
type Picks = Record<string, number>

const read = (): Picks => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Picks
    // блюда, исчезнувшие из меню, отбрасываем
    return Object.fromEntries(Object.entries(raw).filter(([n, q]) => dishByName.has(n) && q > 0))
  } catch { return {} }
}

let picks = read()
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

function write(next: Picks) {
  picks = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* приватный режим: выбор живёт до перезагрузки */ }
  emit()
}

addEventListener('storage', (e) => { if (e.key === KEY) { picks = read(); emit() } })

export function setQty(name: string, qty: number) {
  const next = { ...picks }
  if (qty > 0) next[name] = Math.min(qty, 99)
  else delete next[name]
  write(next)
}
export const clearPicks = () => write({})

export function summarize(p: Picks) {
  const lines = Object.entries(p).map(([name, qty]) => ({ name, qty, sum: dishByName.get(name)!.price * qty }))
  const subtotal = lines.reduce((s, l) => s + l.sum, 0)
  const service = Math.round(subtotal * SERVICE)
  return { lines, count: lines.reduce((s, l) => s + l.qty, 0), subtotal, service, total: subtotal + service }
}

export function useDastorkan() {
  const p = useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => picks)
  return { picks: p, ...summarize(p) }
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many
}

if (import.meta.env.DEV) {
  console.assert(plural(1, 'блюдо', 'блюда', 'блюд') === 'блюдо' && plural(3, 'блюдо', 'блюда', 'блюд') === 'блюда'
    && plural(12, 'блюдо', 'блюда', 'блюд') === 'блюд' && plural(22, 'блюдо', 'блюда', 'блюд') === 'блюда', 'plural')
  const s = summarize({ Манты: 2 })
  console.assert(s.subtotal === 800 && s.service === 120 && s.total === 920, 'summarize')
}
