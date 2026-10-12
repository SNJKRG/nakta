import { MinusIcon, PlusIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { clearPicks, plural, setQty, useDastorkan } from './dastorkan'
import { som, type Dish } from './menu-data'
import { Pic } from './ui'

export const dishesWord = (n: number) => plural(n, 'блюдо', 'блюда', 'блюд')

export function Stepper({ name, qty }: { name: string; qty: number }) {
  if (!qty) {
    return (
      <button type="button" className="add" onClick={() => setQty(name, 1)} aria-label={`Добавить «${name}» в дасторкан`}>
        <PlusIcon size={18} weight="bold" aria-hidden="true" />
      </button>
    )
  }
  return (
    <div className="stepper" role="group" aria-label={`«${name}» в дасторкане`}>
      <button type="button" onClick={() => setQty(name, qty - 1)} aria-label={qty === 1 ? `Убрать «${name}»` : `Меньше: «${name}»`}>
        <MinusIcon size={16} weight="bold" aria-hidden="true" />
      </button>
      <output aria-live="polite">{qty}</output>
      <button type="button" onClick={() => setQty(name, qty + 1)} aria-label={`Больше: «${name}»`}>
        <PlusIcon size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
}

// Строка прайс-листа. На странице меню название открывает карточку, на главной ведёт в раздел меню.
export function DishRow({ dish, qty, onOpen, href }: { dish: Dish; qty: number; onOpen?: () => void; href?: string }) {
  const title = (
    <>
      <span className="dish-row__name">{dish.name}</span>
      {dish.portion && !dish.name.includes(dish.portion) && <span className="dish-row__portion">{dish.portion}</span>}
    </>
  )
  return (
    <li className="dish-row" data-picked={qty > 0 || undefined}>
      <div className="dish-row__main">
        <div className="dish-row__line">
          {onOpen ? (
            <button type="button" className="dish-row__open" onClick={onOpen} aria-haspopup="dialog">{title}</button>
          ) : (
            <a className="dish-row__open" href={href}>{title}</a>
          )}
          <span className="dish-row__dots" aria-hidden="true" />
          <span className="price">{som(dish.price)}</span>
        </div>
        {dish.desc && <p className="dish-row__desc">{dish.desc}</p>}
      </div>
      <Stepper name={dish.name} qty={qty} />
    </li>
  )
}

// Нативный <dialog>: фокус, Esc и инертный фон даёт браузер. На телефоне это панель снизу.
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current!
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="sheet" aria-label={label} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet__body">
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Закрыть"><XIcon size={20} aria-hidden="true" /></button>
        {open && children}
      </div>
    </dialog>
  )
}

export function DishDetail({ dish, qty }: { dish: Dish; qty: number }) {
  return (
    <article className="detail">
      {dish.photo && <Pic pic={dish.photo.pic} alt={dish.photo.alt} sizes="(min-width: 640px) 560px, 100vw" className="detail__photo" />}
      <h2 className="detail__name">{dish.name}</h2>
      <p className="detail__price price">{som(dish.price)}{dish.portion && <span> · {dish.portion}</span>}</p>
      {dish.desc
        ? <><h3 className="detail__h">Состав по меню</h3><p className="detail__desc">{dish.desc}</p></>
        : <p className="detail__desc">Состав этого блюда в меню не расписан, спросите официанта.</p>}
      <p className="detail__note">Вес порции и аллергены уточняйте у официанта.</p>
      <div className="detail__act">
        {qty ? <Stepper name={dish.name} qty={qty} /> : (
          <button type="button" className="btn btn--primary" onClick={() => setQty(dish.name, 1)}>
            <PlusIcon size={18} weight="bold" aria-hidden="true" />В дасторкан
          </button>
        )}
        {qty > 0 && <span className="detail__in">В дасторкане</span>}
      </div>
    </article>
  )
}

export function DastorkanSummary({ onDone }: { onDone?: () => void }) {
  const d = useDastorkan()
  if (!d.count) {
    return (
      <div className="summary">
        <h2 className="summary__title">Дасторкан пока пуст</h2>
        <p className="summary__note">Отмечайте блюда кнопкой «+», здесь появится список и примерная сумма.</p>
      </div>
    )
  }
  return (
    <div className="summary">
      <h2 className="summary__title">Ваш дасторкан</h2>
      <ul className="summary__list">
        {d.lines.map((l) => (
          <li key={l.name}>
            <span className="summary__name">{l.name}</span>
            <Stepper name={l.name} qty={l.qty} />
            <span className="price">{som(l.sum)}</span>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <div><dt>Блюда</dt><dd className="price">{som(d.subtotal)}</dd></div>
        <div><dt>Обслуживание 15%</dt><dd className="price">{som(d.service)}</dd></div>
        <div className="totals__sum"><dt>Примерно к оплате</dt><dd className="price">{som(d.total)}</dd></div>
      </dl>
      <p className="summary__note">Сумма по ценам меню. Выбор сохранён в этом браузере, регистрация не нужна.</p>
      <div className="summary__act">
        <a className="btn btn--primary" href="/#stol" onClick={onDone}>Приложить к запросу стола</a>
        <button type="button" className="btn btn--ghost" onClick={clearPicks}>Очистить</button>
      </div>
    </div>
  )
}
