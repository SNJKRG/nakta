import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { plural, useDastorkan } from './dastorkan'
import { DastorkanSummary, DishDetail, DishRow, dishesWord, Sheet } from './menu-ui'
import { allDishes, categories, som, type Dish } from './menu-data'
import { Footer, Header, Pic } from './ui'

const SCROLL_KEY = 'nakta-menu-scroll'
const norm = (s: string) => s.toLowerCase().replaceAll('ё', 'е')

export default function MenuPage() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(() => location.hash.slice(1) || categories[0].id)
  const [open, setOpen] = useState<Dish | null>(null)
  const [sheet, setSheet] = useState(false)
  const chips = useRef<HTMLDivElement>(null)
  const d = useDastorkan()

  const needle = norm(q.trim())
  const shown = useMemo(
    () => categories
      .map((c) => ({ ...c, items: needle ? c.items.filter((i) => norm(`${i.name} ${i.desc ?? ''}`).includes(needle)) : c.items }))
      .filter((c) => c.items.length),
    [needle],
  )
  const found = shown.reduce((s, c) => s + c.items.length, 0)

  // Позиция просмотра: браузер восстанавливает прокрутку раньше, чем отрисован список, поэтому делаем это сами.
  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    let saved = 0
    try { saved = Number(sessionStorage.getItem(SCROLL_KEY)) || 0 } catch { /* без sessionStorage просто откроем раздел из адреса */ }
    if (nav && nav.type !== 'navigate' && saved) scrollTo({ top: saved, behavior: 'instant' })
    else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
    const save = () => { try { sessionStorage.setItem(SCROLL_KEY, String(scrollY)) } catch { /* см. выше */ } }
    addEventListener('pagehide', save)
    return () => removeEventListener('pagehide', save)
  }, [])

  // Активная категория по прокрутке; она же пишется в адрес, чтобы «назад» и перезагрузка вернули в тот же раздел.
  useEffect(() => {
    let raf = 0
    const spy = () => {
      raf = 0
      const line = innerHeight * 0.3
      const cats = [...document.querySelectorAll<HTMLElement>('.cat')]
      const cur = cats.filter((el) => el.getBoundingClientRect().top <= line).pop() ?? cats[0]
      if (!cur) return
      setActive(cur.id)
      if (location.hash !== `#${cur.id}`) history.replaceState(history.state, '', `#${cur.id}`)
    }
    const onScroll = () => { raf ||= requestAnimationFrame(spy) }
    addEventListener('scroll', onScroll, { passive: true })
    spy()
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [shown])

  // активный чип держим в зоне видимости горизонтальной ленты
  useEffect(() => {
    const row = chips.current
    const chip = row?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (row && chip && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' })
    }
  }, [active])

  const qtyOf = (name: string) => d.picks[name] ?? 0

  return (
    <>
      <a className="skip-link" href="#menu-list">К списку блюд</a>
      <Header page="menu" />
      <main className="menu-page">
        <div className="wrap menu-page__head">
          <h1>Меню</h1>
          <p className="lead">
            {allDishes.length} {plural(allDishes.length, 'позиция', 'позиции', 'позиций')}, цены в сомах. К счёту добавляется обслуживание 15%.
            Отмечайте блюда «+», чтобы собрать дасторкан и прикинуть сумму.
          </p>
        </div>

        <div className="menu-page__grid wrap">
          <div className="menu-tools">
            <div className="search">
              <label htmlFor="menu-q">Поиск по меню</label>
              <div className="search__field">
                <MagnifyingGlassIcon size={20} aria-hidden="true" />
                <input id="menu-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Плов, манты, чай…" autoComplete="off" enterKeyHint="search" />
                {q && (
                  <button type="button" className="search__clear" onClick={() => setQ('')} aria-label="Очистить поиск">
                    <XIcon size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <nav className="chips" aria-label="Разделы меню" ref={chips}>
              {shown.map((c) => (
                <a key={c.id} data-id={c.id} href={`#${c.id}`} aria-current={active === c.id ? 'true' : undefined}>
                  {c.title}
                  {needle && <small>{c.items.length}</small>}
                </a>
              ))}
            </nav>
          </div>

          <div id="menu-list" className="menu-list">
            <p className="sr-only" aria-live="polite">{needle ? `Найдено: ${found}` : ''}</p>
            {shown.map((c) => (
              <section key={c.id} id={c.id} className="cat" aria-labelledby={`${c.id}-t`}>
                <h2 id={`${c.id}-t`} className="cat__title">{c.title}</h2>
                {c.cover && !needle && (
                  <figure className="cat__cover">
                    <Pic pic={c.cover.pic} alt={c.cover.alt} sizes="(min-width: 1024px) 780px, 100vw" />
                  </figure>
                )}
                <ul className="dish-list">
                  {c.items.map((dish) => (
                    <DishRow key={dish.name} dish={dish} qty={qtyOf(dish.name)} onOpen={() => setOpen(dish)} />
                  ))}
                </ul>
              </section>
            ))}
            {!found && (
              <div className="empty">
                <p>По запросу «{q.trim()}» ничего нет. Попробуйте другое слово или посмотрите разделы.</p>
                <button type="button" className="btn btn--ghost" onClick={() => setQ('')}>Сбросить поиск</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <div className="dock" data-empty={!d.count || undefined}>
        <div className="dock__inner">
          {d.count ? (
            <button type="button" className="dock__summary" onClick={() => setSheet(true)} aria-haspopup="dialog">
              <span>Дасторкан: {d.count} {dishesWord(d.count)}</span>
              <span className="price">{som(d.subtotal)} + 15%</span>
            </button>
          ) : (
            <span className="dock__hint">Нажмите «+», чтобы собрать дасторкан</span>
          )}
          <a className="btn btn--primary dock__cta" href="/#stol">Запросить стол</a>
        </div>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} label={open?.name ?? 'Блюдо'}>
        {open && <DishDetail dish={open} qty={qtyOf(open.name)} />}
      </Sheet>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="Ваш дасторкан">
        <DastorkanSummary onDone={() => setSheet(false)} />
      </Sheet>
    </>
  )
}
