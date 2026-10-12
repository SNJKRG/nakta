import { ArrowRightIcon, InstagramLogoIcon, MapTrifoldIcon, PhoneIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { address, featured, gis, hours, instagram, phones, spaces, whatsapp } from './content'
import { plural, useDastorkan } from './dastorkan'
import {
  boorsok, carvedDish, carvedWood, domePastry, entrance, hallLong, hallLounge, hallMountains, steakBoard, storyKitchen, storyServing,
} from './media'
import { allDishes, dishByName, som } from './menu-data'
import { DishRow, dishesWord } from './menu-ui'
import Hero from './Hero'
import { Footer, Header, Ornament, Pic, Tabbar } from './ui'

export default function Home() {
  const [space, setSpace] = useState('')
  const ask = (id: string) => {
    setSpace(id)
    document.getElementById('stol')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setTimeout(() => document.getElementById('f-date')?.focus({ preventScroll: true }), 400)
  }

  return (
    <>
      <a className="skip-link" href="#main">К содержанию</a>
      <Header page="home" />
      <main id="main">
        <Hero />
        <h1 className="sr-only">NAKTA, этно-ресторан кыргызской кухни в Кок-Жаре</h1>
        <Dishes />
        <Halls onAsk={ask} />
        <Story />
        <Booking space={space} setSpace={setSpace} />
        <Contacts />
      </main>
      <Footer />
      <Tabbar />
    </>
  )
}

function Dishes() {
  const d = useDastorkan()
  return (
    <section id="blyuda" className="section dishes" aria-labelledby="dishes-t">
      <div className="wrap dishes__grid">
        <figure className="dishes__photo">
          <div className="arch"><Pic pic={domePastry} alt="Купол из слоёного теста на резной деревянной чаше, внутри мясо и овощи" sizes="(min-width: 900px) 42vw, 100vw" /></div>
          <figcaption>Подача под куполом из теста, резная деревянная чаша</figcaption>
        </figure>
        <div className="dishes__text">
          <h2 id="dishes-t">Что ставят на дасторкан</h2>
          <p className="lead">
            Плов и куурдак на всю компанию, наваристые шорпо, манты и боорсоки к чаю. Шесть блюд из меню для большого стола:
          </p>
          <ul className="dish-list dish-list--home">
            {featured.map((n) => {
              const dish = allDishes.find((x) => x.name === n)!
              return <DishRow key={n} dish={dish} qty={d.picks[n] ?? 0} href={`/menu/#${dish.cat}`} />
            })}
          </ul>
          <div className="dishes__act">
            <a className="btn btn--primary" href="/menu/">Открыть всё меню <ArrowRightIcon size={18} aria-hidden="true" /></a>
            <span className="dishes__note">{allDishes.length} {plural(allDishes.length, 'позиция', 'позиции', 'позиций')} с ценами · обслуживание 15%</span>
          </div>
        </div>
      </div>
      <div className="wrap strip">
        <figure className="strip__a">
          <Pic pic={carvedDish} alt="Мясо с картофелем и овощами в резной деревянной чаше" sizes="(min-width: 900px) 26vw, 60vw" />
          <figcaption>Горячее в резной чаше</figcaption>
        </figure>
        <figure className="strip__b">
          <Pic pic={boorsok} alt="Большое блюдо боорсоков, рядом лепёшки" sizes="(min-width: 900px) 34vw, 80vw" />
          <figcaption>Боорсоки, {som(dishByName.get('Боорсоки')!.price)}</figcaption>
        </figure>
        <figure className="strip__c">
          <Pic pic={steakBoard} alt="Стейк с овощами гриль на доске с гравировкой NAKTA" sizes="(min-width: 900px) 34vw, 90vw" />
          <figcaption>Стейки на доске с клеймом NAKTA</figcaption>
        </figure>
      </div>
    </section>
  )
}

function Halls({ onAsk }: { onAsk: (id: string) => void }) {
  const [a, b] = spaces
  return (
    <section id="zaly" className="section section--dark halls" aria-labelledby="halls-t">
      <div className="wrap">
        <Ornament className="ornament--dark" />
        <div className="halls__head">
          <h2 id="halls-t">Залы для торжеств на 5–110 гостей</h2>
          <p className="lead">
            Той, юбилей, свадьба или семейный ужин. Расскажите, сколько будет гостей, и администратор предложит зал и меню банкета.
          </p>
        </div>

        <article className="space space--a" aria-labelledby="space-a">
          <Pic className="space__main" pic={hallLong} alt="Банкетный зал: длинный накрытый стол, люстры, ковры на стенах, роспись с пейзажем" sizes="(min-width: 900px) 58vw, 100vw" />
          <Pic className="space__side" pic={hallLounge} alt="Мягкая зона с диванами у окна, на стенах ковры" sizes="(min-width: 900px) 24vw, 50vw" />
          <div className="space__text">
            <h3 id="space-a">{a.name}</h3>
            <p>{a.text}</p>
            <button type="button" className="btn btn--light" onClick={() => onAsk(a.id)}>Запросить этот зал</button>
          </div>
        </article>

        <article className="space space--b" aria-labelledby="space-b">
          <div className="space__text">
            <h3 id="space-b">{b.name}</h3>
            <p>{b.text}</p>
            <button type="button" className="btn btn--light" onClick={() => onAsk(b.id)}>Запросить этот зал</button>
          </div>
          <Pic className="space__main" pic={hallMountains} alt="Зал с росписью гор, деревянный потолок, накрытый банкетный стол" sizes="(min-width: 900px) 30vw, 80vw" />
        </article>
        <p className="halls__fine">Точную вместимость каждого зала и свободные даты подтверждает администратор.</p>
      </div>
    </section>
  )
}

function Story() {
  return (
    <section id="istoriya" className="section story" aria-labelledby="story-t">
      <div className="wrap">
        <div className="story__head">
          <h2 id="story-t">Как накрывают в NAKTA</h2>
          <p className="lead">Современная кыргызская кухня, большие блюда на компанию и сервировка из резного дерева.</p>
        </div>
        <div className="story__grid">
          <figure className="tale tale--wide">
            <Pic pic={carvedWood} alt="Деревянные чаши с резными крышками и пиалы с кыргызским орнаментом" sizes="(min-width: 900px) 46vw, 100vw" />
            <figcaption>
              <h3>Резное дерево на столе</h3>
              <p>Чаши с резными крышками, деревянные пиалы и подносы с орнаментом. Сервировка, которую узнаёшь с порога.</p>
            </figcaption>
          </figure>
          <figure className="tale">
            <Pic pic={storyServing} alt="Официанты в калпаках выносят многоярусное блюдо с мясом" sizes="(min-width: 900px) 22vw, 70vw" />
            <figcaption>
              <h3>Блюдо выносят к столу</h3>
              <p>Большие блюда приносят на деревянных ярусах. Официанты в калпаках и фартуках с эмблемой NAKTA.</p>
            </figcaption>
          </figure>
          <figure className="tale tale--low">
            <Pic pic={storyKitchen} alt="На кухне плов с казы раскладывают по резным деревянным блюдам" sizes="(min-width: 900px) 22vw, 70vw" />
            <figcaption>
              <h3>Плов с казы</h3>
              <p>Перед подачей плов раскладывают по резным деревянным блюдам, сверху кладут казы.</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const humanDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}

type Form = { date: string; time: string; guests: string; name: string; phone: string; comment: string; withPicks: boolean }
type Errors = Partial<Record<keyof Form, string>>

function validate(f: Form, today: string): Errors {
  const e: Errors = {}
  if (!f.date) e.date = 'Выберите дату'
  else if (f.date < today) e.date = 'Эта дата уже прошла'
  if (!f.time) e.time = 'Укажите время'
  else if (f.time < '11:00') e.time = 'Ресторан открывается в 11:00'
  const g = Number(f.guests)
  if (!Number.isInteger(g) || g < 1) e.guests = 'Сколько будет гостей?'
  else if (g > 110) e.guests = 'Самый большой банкет — до 110 гостей. Позвоните нам'
  if (f.name.trim().length < 2) e.name = 'Как к вам обращаться?'
  if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Номер нужен полностью, например 0555 123 456'
  return e
}

function Booking({ space, setSpace }: { space: string; setSpace: (v: string) => void }) {
  const today = isoDay(new Date())
  const d = useDastorkan()
  const [f, setF] = useState<Form>({ date: '', time: '', guests: '', name: '', phone: '', comment: '', withPicks: true })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState('')
  const set = (k: keyof Form) => (e: { target: { value: string; checked?: boolean; type?: string } }) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const e = validate(f, today)
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) { document.getElementById(`f-${first}`)?.focus(); return }
    const room = spaces.find((s) => s.id === space)
    const lines = [
      'Здравствуйте! Хочу забронировать стол в NAKTA.',
      `Дата: ${humanDay(f.date)}`,
      `Время: ${f.time}`,
      `Гостей: ${f.guests}`,
      room && `Зал: ${room.name}`,
      `Имя: ${f.name.trim()}`,
      `Телефон: ${f.phone.trim()}`,
      f.comment.trim() && `Пожелания: ${f.comment.trim()}`,
      d.count && f.withPicks && `\nДасторкан, который мы выбрали на сайте (примерно ${som(d.total)} с обслуживанием):`,
      ...(d.count && f.withPicks ? d.lines.map((l) => `• ${l.name} × ${l.qty}`) : []),
    ].filter(Boolean)
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
    setSent(url)
    window.open(url, '_blank', 'noopener')
  }

  const err = (k: keyof Form) => errors[k] && <span className="field__err" id={`e-${k}`}>{errors[k]}</span>
  const aria = (k: keyof Form) => ({ 'aria-invalid': !!errors[k] || undefined, 'aria-describedby': errors[k] ? `e-${k}` : undefined })

  return (
    <section id="stol" className="section section--sand booking" aria-labelledby="booking-t">
      <div className="wrap booking__grid">
        <div className="booking__intro">
          <h2 id="booking-t">Запросить стол</h2>
          <p className="lead">
            Заполните форму, и мы подготовим сообщение в WhatsApp. Бронь подтверждает администратор в ответ на сообщение или по телефону.
          </p>
          <div className="ticket">
            <dl>
              <div><dt>Адрес</dt><dd>{address}</dd></div>
              <div><dt>Часы</dt><dd>{hours}</dd></div>
            </dl>
            <p className="ticket__label">Позвонить администратору</p>
            {phones.map((p) => <a key={p.tel} className="ticket__phone" href={`tel:${p.tel}`}>{p.label}</a>)}
          </div>
        </div>

        <form className="form" onSubmit={submit} noValidate>
          <div className="form__row form__row--3">
            <div className="field">
              <label htmlFor="f-date">Дата</label>
              <input id="f-date" type="date" min={today} value={f.date} onChange={set('date')} required {...aria('date')} />
              {err('date')}
            </div>
            <div className="field">
              <label htmlFor="f-time">Время</label>
              <input id="f-time" type="time" min="11:00" max="23:30" step={1800} value={f.time} onChange={set('time')} required {...aria('time')} />
              {err('time')}
            </div>
            <div className="field">
              <label htmlFor="f-guests">Гостей</label>
              <input id="f-guests" type="number" inputMode="numeric" min={1} max={110} value={f.guests} onChange={set('guests')} required {...aria('guests')} />
              {err('guests')}
            </div>
          </div>
          <div className="form__row">
            <div className="field">
              <label htmlFor="f-name">Имя</label>
              <input id="f-name" autoComplete="name" value={f.name} onChange={set('name')} required {...aria('name')} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="f-phone">Телефон</label>
              <input id="f-phone" type="tel" autoComplete="tel" placeholder="0555 123 456" value={f.phone} onChange={set('phone')} required {...aria('phone')} />
              {err('phone')}
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-space">Зал</label>
            <select id="f-space" className="select" value={space} onChange={(e) => setSpace(e.target.value)}>
              <option value="">Любой подходящий</option>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-comment">Повод и пожелания <span className="field__opt">необязательно</span></label>
            <textarea id="f-comment" rows={3} value={f.comment} onChange={set('comment')} />
          </div>
          {d.count > 0 && (
            <label className="check">
              <input type="checkbox" checked={f.withPicks} onChange={set('withPicks')} />
              <span>Приложить дасторкан: {d.count} {dishesWord(d.count)}, примерно {som(d.total)} с обслуживанием</span>
            </label>
          )}
          <button type="submit" className="btn btn--primary btn--wide"><WhatsappLogoIcon size={20} aria-hidden="true" />Отправить запрос в WhatsApp</button>
          <div aria-live="polite">
            {sent && (
              <div className="sent">
                <p><b>Сообщение готово.</b> Отправьте его в открывшемся чате WhatsApp. Стол забронирован, когда администратор ответит и подтвердит.</p>
                <p>WhatsApp не открылся? <a href={sent} target="_blank" rel="noreferrer">Открыть чат</a> или позвоните: <a href={`tel:${phones[0].tel}`}>{phones[0].label}</a></p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

function Contacts() {
  return (
    <section id="kontakty" className="section contacts" aria-labelledby="contacts-t">
      <div className="wrap contacts__grid">
        <figure className="contacts__photo">
          <div className="arch arch--small"><Pic pic={entrance} alt="Здание NAKTA: светлый фасад с арочным входом и орнаментальными панелями" sizes="(min-width: 900px) 360px, 70vw" /></div>
          <figcaption>Вход в NAKTA</figcaption>
        </figure>
        <div className="contacts__text">
          <h2 id="contacts-t">Как нас найти</h2>
          <p className="contacts__addr">{address}</p>
          <dl className="contacts__dl">
            <div><dt>Часы работы</dt><dd>{hours}</dd></div>
            <div><dt>Телефон</dt><dd>{phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}>{p.label}</a>)}</dd></div>
          </dl>
          <div className="contacts__act">
            <a className="btn btn--primary" href={gis} target="_blank" rel="noreferrer"><MapTrifoldIcon size={20} aria-hidden="true" />Маршрут в 2GIS</a>
            <a className="btn btn--ghost" href={`tel:${phones[0].tel}`}><PhoneIcon size={20} aria-hidden="true" />Позвонить</a>
            <a className="link" href={instagram} target="_blank" rel="noreferrer"><InstagramLogoIcon size={20} aria-hidden="true" />@nakta_restaurant</a>
          </div>
        </div>
      </div>
    </section>
  )
}
