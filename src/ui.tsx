import { CallBellIcon, ForkKnifeIcon, MapPinIcon } from '@phosphor-icons/react'
import emblemSvg from './emblem.svg?raw'
import lockupSvg from './lockup.svg?raw'
import wordmarkSvg from './wordmark.svg?raw'
import { address, hours, instagram, nav, phones } from './content'

export type Picture = { sources: Record<string, string>; img: { src: string; w: number; h: number } }

export function Pic({ pic, alt, sizes, eager, className }: { pic: Picture; alt: string; sizes: string; eager?: boolean; className?: string }) {
  const { jpeg, jpg, ...modern } = pic.sources
  return (
    <picture className={className}>
      {Object.entries(modern).map(([fmt, srcSet]) => (
        <source key={fmt} type={`image/${fmt}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img src={pic.img.src} srcSet={jpeg ?? jpg} sizes={sizes} width={pic.img.w} height={pic.img.h} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  )
}

// Векторные реконструкции логотипа (nakta-assets/logo), цвет через currentColor.
const Svg = ({ svg, className }: { svg: string; className?: string }) => (
  <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
)
export const Emblem = ({ className }: { className?: string }) => <Svg svg={emblemSvg} className={className} />
export const Wordmark = ({ className }: { className?: string }) => <Svg svg={wordmarkSvg} className={className} />
export const Lockup = ({ className }: { className?: string }) => <Svg svg={lockupSvg} className={className} />

// Орнаментальный разделитель: знак между двумя линиями.
export const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`ornament ${className}`} aria-hidden="true"><Emblem className="ornament__mark" /></div>
)

export function Header({ page }: { page: 'home' | 'menu' }) {
  return (
    <header className="header">
      <div className="wrap header__inner">
        <a className="brand" href="/" aria-label="NAKTA, этно-ресторан, на главную">
          <Emblem className="brand__emblem" />
          <Wordmark className="brand__word" />
        </a>
        <nav className="nav" aria-label="Основная">
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={page === 'menu' && n.href === '/menu/' ? 'page' : undefined}>{n.label}</a>
          ))}
        </nav>
        <a className="btn btn--primary header__cta" href="/#stol">Запросить стол</a>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <Lockup className="footer__lockup" />
        <div>
          <h2 className="footer__h">Адрес</h2>
          <p>{address}<br />Открыто {hours}</p>
        </div>
        <div>
          <h2 className="footer__h">Телефон</h2>
          <ul>{phones.map((p) => <li key={p.tel}><a href={`tel:${p.tel}`}>{p.label}</a></li>)}</ul>
        </div>
        <div>
          <h2 className="footer__h">Разделы</h2>
          <ul>
            {nav.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
            <li><a href={instagram} target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer__base">
        <span>© NAKTA, этно-ресторан</span>
        <span>Цены в меню могут измениться, уточняйте у официанта</span>
      </div>
    </footer>
  )
}

// Нижняя панель на телефоне: три главных действия.
export function Tabbar() {
  return (
    <nav className="tabbar" aria-label="Быстрые действия">
      <a href="/menu/"><ForkKnifeIcon size={22} aria-hidden="true" />Меню</a>
      <a href="/#stol"><CallBellIcon size={22} aria-hidden="true" />Стол</a>
      <a href="/#kontakty"><MapPinIcon size={22} aria-hidden="true" />Адрес</a>
    </nav>
  )
}
