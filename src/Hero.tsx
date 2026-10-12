import { CaretRightIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import emblemSvg from './emblem.svg?raw'
import wordmarkSvg from './wordmark.svg?raw'
import './hero.css'

// Видео: nakta-yurt-video 2 (Omni 1.1 по 3D-превизу). Постеры — первый и последний кадры того же ролика.
// Сценарий: первый кадр + пар + текст → прокрутка вниз запускает ролик (страница стоит) → пар поднимается
// к түндүку → түндүк становится знаком NAKTA → прокрутка свободна. Ссылки шапки и таб-бара работают всегда.
const FINALE_LEAD = 0.9   // с до конца: знак начинает рисоваться, когда камера уже смотрит в купол
const HAZE = [4.0, 5.9]   // с: дымка над куполом — прячет искажения жердей на подъёме камеры (4,4–5,4 с в hero-1080)
const TUNDUK = 0.44       // центр түндүка по вертикали в последнем кадре (0–1), замерено по hero-1080
const BOWL = 0.5          // поверхность чая в первом кадре (0–1), замерено по hero-1080
const HEADER_DELAY = 1100 // мс: шапка проявляется после первого кадра
const GIVE_UP = 12000     // мс: видео так и не загрузилось → финальная композиция, прокрутка свободна

// pathLength=1 для эффекта прорисовки контура, --i — задержка для каждого контура
let n = 0
const emblemDraw = emblemSvg.replace(/<path/g, () => `<path pathLength="1" style="--i:${n++}"`)

const vars = (o: Record<string, string | number>) => o as CSSProperties
// фразы до прокрутки сменяют друг друга; период = длительность анимации hero-cycle
const PHRASES = [
  ['Чай уже налит,', 'садитесь ближе'],
  ['Боорсоки тёплые,', 'угощайтесь'],
  ['За дасторконом', 'всем хватит места'],
  ['Пришёл гость —', 'пришло счастье'],
]
const CYCLE = 4800 // мс, совпадает с --cycle в hero.css
// пар над пиалой: смещение, ширина (vmin), период, фаза, снос, наклон, плотность
const WISPS = [
  [-3, 9, 4.6, -0.2, -4, -8, 0.75], [2, 7, 5.2, -1.6, 5, 10, 0.6], [-1, 11, 5.8, -3.1, -2, 6, 0.55], [4, 8, 4.9, -2.4, 7, -12, 0.5],
  [-5, 6, 4.3, -3.8, -6, 14, 0.6], [0, 13, 6.4, -4.5, 3, -5, 0.4], [1, 5, 3.9, -0.9, -3, 9, 0.7],
].map(([x, w, d, delay, dx, r, o]) => vars({ '--x': x, '--w': w, '--d': `${d}s`, '--delay': `${delay}s`, '--dx': dx, '--r': `${r}deg`, '--o': o }))
// дым к түндүку: позиция по горизонтали (%), размер (vmin), задержка, снос
const SMOKE = [[18, 70, 0, 6], [44, 90, .15, -4], [70, 75, .3, -8], [32, 60, .5, 10], [58, 85, .65, 4], [84, 65, .4, -6]]
  .map(([x, s, delay, dx]) => vars({ '--x': `${x}%`, '--s': s, '--delay': `${delay}s`, '--dx': dx }))

type Phase = 'intro' | 'playing' | 'ending' | 'done' | 'static'
const PHASE_CLASS: Record<Phase, string> = {
  intro: '', playing: 'is-playing', ending: 'is-playing is-ending', done: 'is-playing is-ending is-done', static: 'is-go is-playing is-ending is-done is-static',
}
const DOWN = ['ArrowDown', 'PageDown', ' ', 'End']
const SCROLL_KEYS = [...DOWN, 'ArrowUp', 'PageUp', 'Home']

export default function Hero() {
  const hero = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const lastSource = useRef<HTMLSourceElement>(null)   // ошибка последнего источника = видео недоступно
  const locked = useRef(true)                          // синхронно, чтобы клик по ссылке успел снять блокировку
  const skipRef = useRef(() => {})
  const [phase, setPhase] = useState<Phase>('intro')
  const [ready, setReady] = useState(false)            // видео буферизовано
  const [go, setGo] = useState(false)                  // пользователь начал прокрутку
  const [haze, setHaze] = useState(false)
  const [steam, setSteam] = useState(true)
  const [phrase, setPhrase] = useState(0)

  // знак ровно над түндүком, пар над пиалой — при любом кадрировании object-fit: cover
  useEffect(() => {
    const h = hero.current!, v = video.current!
    const place = () => {
      const W = h.clientWidth, H = h.clientHeight, vw = v.videoWidth || 16, vh = v.videoHeight || 9
      const s = Math.max(W / vw, H / vh), y = (k: number) => `${(H / 2 + (k - 0.5) * vh * s).toFixed(1)}px`
      h.style.setProperty('--logo-y', y(TUNDUK))
      h.style.setProperty('--bowl-y', y(BOWL))
    }
    const ro = new ResizeObserver(place)
    ro.observe(h)
    v.addEventListener('loadedmetadata', place)
    return () => { ro.disconnect(); v.removeEventListener('loadedmetadata', place) }
  }, [])

  useEffect(() => {
    const h = hero.current!, v = video.current!, last = lastSource.current!, root = document.documentElement
    const offs: Array<() => void> = [], timers: number[] = []
    let raf = 0
    const on = (t: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) => {
      t.addEventListener(type, fn, opts); offs.push(() => t.removeEventListener(type, fn, opts))
    }
    const cleanup = () => { offs.forEach((f) => f()); timers.forEach(clearTimeout); cancelAnimationFrame(raf); delete root.dataset.hero }

    // шапка: стекло, пока под ней hero; обычная, как только hero ушёл вверх
    const syncHeader = () => {
      raf = 0
      const headerH = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 68
      root.dataset.hero = h.getBoundingClientRect().bottom > headerH ? 'glass' : 'solid'
    }
    on(window, 'scroll', () => { if (!raf) raf = requestAnimationFrame(syncHeader) }, { passive: true })

    const toStatic = () => { locked.current = false; setPhase('static'); setHaze(false) }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    // прямая ссылка на раздел (/#stol) ведёт сразу туда, без вступления
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || saveData || location.hash) {
      toStatic(); syncHeader(); return cleanup
    }
    // ролик запускается при каждой загрузке: после перезагрузки страница начинается сверху
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    offs.push(() => { history.scrollRestoration = restoration })
    scrollTo({ top: 0, behavior: 'instant' })

    root.dataset.hero = 'hidden'
    timers.push(window.setTimeout(syncHeader, HEADER_DELAY))

    // видео начинает грузиться только здесь: в статичном режиме оно не скачивается
    v.preload = 'auto'
    v.load()
    let want = false, canPlay = false
    const play = () => v.play().catch(toStatic)
    const buffered = () => { if (canPlay) return; canPlay = true; setReady(true); if (want) play() }
    on(v, 'canplaythrough', buffered)
    on(last, 'error', toStatic)
    // пар рассеивается, только когда первый кадр на экране (постер = кадр 0, скачка нет)
    on(v, 'playing', () => setPhase((p) => (p === 'intro' ? 'playing' : p)))
    on(v, 'timeupdate', () => {
      const t = v.currentTime
      setHaze(t >= HAZE[0] && t < HAZE[1])
      if (v.duration && t >= v.duration - FINALE_LEAD) setPhase((p) => (p === 'playing' ? 'ending' : p))
    })
    on(v, 'ended', () => { locked.current = false; setHaze(false); setPhase('done') })
    timers.push(window.setTimeout(() => { if (!canPlay) v.readyState >= 3 ? buffered() : toStatic() }, GIVE_UP))

    const start = () => { if (want) return; want = true; setGo(true); if (canPlay) play() }
    const skip = () => {
      if (!locked.current) return
      locked.current = false; setGo(true); setHaze(false); v.pause()
      if (v.duration) { v.currentTime = v.duration; setPhase('done') } else setPhase('static')
    }
    skipRef.current = skip

    // страница стоит, пока идёт ролик: жест вниз запускает его вместо прокрутки
    const block = (e: Event) => { if (e.cancelable) e.preventDefault() }
    on(window, 'wheel', (e) => { if (!locked.current) return; block(e); if ((e as WheelEvent).deltaY > 0) start() }, { passive: false })
    let y0 = 0
    on(window, 'touchstart', (e) => { y0 = (e as TouchEvent).touches[0].clientY }, { passive: true })
    on(window, 'touchmove', (e) => {
      const t = e as TouchEvent
      if (!locked.current || t.touches.length > 1) return                       // щипок-зум не трогаем
      block(e); if (y0 - t.touches[0].clientY > 10) start()
    }, { passive: false })
    on(window, 'keydown', (e) => {
      const k = e as KeyboardEvent
      if (!locked.current || !SCROLL_KEYS.includes(k.key)) return
      if (k.key === ' ' && (k.target as Element).closest('a, button, input, textarea, select, [contenteditable]')) return
      block(e); if (DOWN.includes(k.key)) start()
    })
    on(window, 'scroll', () => { if (locked.current && scrollY > 0) scrollTo({ top: 0, behavior: 'instant' }) }, { passive: true })  // перетаскивание полосы прокрутки
    // ссылки шапки и таб-бара открыты всегда: переход по ним заканчивает вступление
    on(document, 'click', (e) => { if (locked.current && (e.target as Element).closest?.('a[href]')) skip() }, { capture: true })

    return cleanup
  }, [])

  const finale = phase === 'ending' || phase === 'done' || phase === 'static'

  // смена фраз только пока ждём прокрутку
  useEffect(() => {
    if (go || phase === 'static') return
    const id = window.setInterval(() => setPhrase((i) => (i + 1) % PHRASES.length), CYCLE)
    return () => clearInterval(id)
  }, [go, phase])

  return (
    <section ref={hero} className={`hero ${go ? 'is-go' : ''} ${haze ? 'is-haze' : ''} ${PHASE_CLASS[phase]}`}
      aria-label="NAKTA, этно-ресторан" aria-busy={!ready && phase === 'intro'}>
      <video ref={video} className="hero__video" muted playsInline preload="none" poster="/hero/poster.webp" disablePictureInPicture aria-hidden="true">
        <source src="/hero/hero-1080.mp4" type="video/mp4" media="(min-width: 1100px)" />
        <source ref={lastSource} src="/hero/hero-720.mp4" type="video/mp4" />
      </video>
      <div className="hero__shade" />
      <div className="hero__haze" aria-hidden="true">{SMOKE.map((style, i) => <i key={i} style={style} />)}</div>

      {steam && (
        <div className="hero__steam" aria-hidden="true" onTransitionEnd={(e) => { if (e.target === e.currentTarget) setSteam(false) }}>
          {WISPS.map((style, i) => <i key={i} style={style} />)}
        </div>
      )}

      <div className="hero__intro" aria-hidden={go}>
        <p className="hero__over">Кок-Жар, Бишкек</p>
        <p className="hero__title" key={phrase}>
          {PHRASES[phrase].map((text, i) => <span key={i} className="hero__line"><span style={vars({ '--n': i })}>{text}</span></span>)}
        </p>
      </div>
      <span className="sr-only" role="status">{ready ? '' : 'Загружаем видео'}</span>

      <div className="hero__veil" />
      <div className="hero__brand">
        <span className="hero__emblem" aria-hidden="true" dangerouslySetInnerHTML={{ __html: emblemDraw }} />
        <span className="hero__word" aria-hidden="true" dangerouslySetInnerHTML={{ __html: wordmarkSvg }} />
        <p className="hero__slogan">Дасторкон ждёт всю семью</p>
        <p className="hero__sub">Современная этническая кухня</p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="/#stol" tabIndex={finale ? 0 : -1}>Запросить стол</a>
          <a className="btn btn--light" href="/menu/" tabIndex={finale ? 0 : -1}>Смотреть меню</a>
        </div>
      </div>

      <button className="hero__skip" type="button" onClick={() => skipRef.current()} tabIndex={go && !finale ? 0 : -1} aria-label="Перемотать к концу видео">
        <CaretRightIcon size={20} aria-hidden="true" />
      </button>
    </section>
  )
}
