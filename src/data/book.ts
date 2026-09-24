export type PageKind =
  | 'ceo'
  | 'text'
  | 'split'
  | 'route'
  | 'section-open'
  | 'interstitial'
  | 'history-era'
  | 'mission-eco'
  | 'mission-statement'
  | 'mission-ecosystem'
  | 'mission-longevity'
  | 'mission-strategy-spread'
  | 'mission-strategy-house'
  | 'mission-uniqueness'
  | 'values-spread'
  | 'value-ambition'
  | 'value-passion'
  | 'value-responsibility'
  | 'mastery-gallery'
  | 'mastery-semavic'
  | 'mastery-venezuela'
  | 'mastery-third-line'
  | 'mastery-putin'
  | 'env-navigator'
  | 'practice-gallery'
  | 'practice-equipment'
  | 'practice-weeks'
  | 'practice-error-first'
  | 'practice-market'
  | 'practice-modernization'
  | 'practice-ai'
  | 'practice-long-term'
  | 'practice-methodology'
  | 'practice-bureaucracy'
  | 'practice-habits'
  | 'closing-cover'
  | 'timeline'
  | 'values'
  | 'quote'
  | 'facts'

export interface FactStat {
  value: number
  label: string
  prefix?: string
  suffix?: string
}

export interface RouteItem {
  title: string
  desc: string
  sectionId: string
  pageId?: string
}

export interface BookPage {
  id: string
  kind: PageKind
  title?: string
  badge?: string
  body?: string[]
  quote?: string
  meta?: Record<string, string>
  years?: { year: string; text: string }[]
  values?: { name: string; desc: string; color: string }[]
  facts?: FactStat[]
  routeItems?: RouteItem[]
  sideTitle?: string
  sideItems?: string[]
  footerSlogan?: string
}

export interface Paragraph {
  id: string
  title: string
  pages: BookPage[]
}

export interface Section {
  id: string
  number: string
  title: string
  tag: string
  summary: string
  accent: string
  paragraphs: Paragraph[]
  /** If false, section is omitted from progress / contents / menu */
  nav?: boolean
}

export const BOOK_META = {
  title: 'Культурный путеводитель ГЕРОФАРМ',
  hashtag: '#КОМПАНИЮ_МЕНЯЮТ_ЛЮДИ',
  badge: 'ГЕРОФАРМ · ТРАНСФОРМАЦИЯ',
  subtitle: 'Разделы о корпоративной культуре ГЕРОФАРМ',
}

/** Разметка содержания по PPTX «Путеводитель по культуре ГЕРОФАРМ 07.09.2026» */
export const sections: Section[] = [
  {
    id: 'intro',
    number: '01',
    title: 'Добро пожаловать',
    tag: 'СМЫСЛЫ / СТАРТ',
    summary: 'Как сегодняшние смыслы определяют завтрашний результат',
    accent: '#2C1264',
    paragraphs: [
      {
        id: 'ceo',
        title: 'Обращение генерального директора',
        pages: [
          {
            id: 'p-ceo',
            kind: 'ceo',
            badge: 'ОБРАЩЕНИЕ ГЕНЕРАЛЬНОГО ДИРЕКТОРА',
            title: 'Как сегодняшние смыслы определяют завтрашний результат',
            body: [
              'ГЕРОФАРМ отмечает 25 лет. Это хороший повод оценить пройденный путь и заглянуть в будущее. Мир меняется быстрее, чем когда-либо. Чтобы оставаться лидерами, важно постоянно учиться, адаптироваться и двигаться вперед.',
              'Сегодня мы реализуем Стратегию 2030, закладываем фундамент будущего: внедряем инновации, развиваем производство, наращиваем экспорт, укрепляем команду, формируем партнерства, совершенствуем процессы.',
              'Эта книга — о нас. О культуре людей, которые своими действиями меняют жизнь пациентов к лучшему. За годы становления мы научились действовать в неопределенности и находить возможности там, где другие видят ограничения.',
              'Через пять лет многое изменится: рынок, технологии, мы сами. Но неизменным останется главное — стремление создавать решения, которые помогают людям жить дольше. Следующий этап истории ГЕРОФАРМ пишем мы с вами. Прямо сейчас.',
            ],
            meta: {
              name: 'Петр Родионов',
              role: 'Генеральный директор ГЕРОФАРМ',
              photo: 'img/03.jpg',
            },
          },
        ],
      },
      {
        id: 'journey',
        title: 'Путешествие в культуру',
        pages: [
          {
            id: 'p-journey',
            kind: 'split',
            title: 'Вы начинаете путешествие в культуру ГЕРОФАРМ',
            body: [
              'Эта книга — стратегический ориентир для всех сотрудников. Она о том, что нас объединяет, зачем мы работаем и как принимаем решения.',
              'Мы работаем в отрасли, где каждое решение влияет на здоровье пациентов, развитие отечественной медицины и фармацевтический суверенитет страны. Поэтому важно понимать свои задачи и видеть картину в целом.',
              '«За кадром» осталось ещё много историй, традиций, полезных инструментов — они войдут в продолжение нашей книги.',
            ],
            sideTitle: 'Эта книга поможет:',
            sideItems: [
              'Скоординировать ежедневную работу со стратегией',
              'Сделать верный выбор в неоднозначной ситуации',
              'Руководителям — выстраивать команду на основе единых смыслов',
              'Новым сотрудникам — быстрее погрузиться в жизнь компании',
              'Опытным коллегам — увидеть новое в привычных вещах.',
            ],
            footerSlogan: 'У КАЖДОГО ИЗ НАС СВОЯ РОЛЬ,\nНАС ОБЪЕДИНЯЕТ КУЛЬТУРА ГЕРОФАРМ',
            meta: {
              logo: 'logo/gero_trans_clear.png',
            },
          },
        ],
      },
      {
        id: 'route',
        title: 'Маршрут',
        pages: [
          {
            id: 'p-route',
            kind: 'route',
            title: 'Маршрут: от смыслов к конкретным шагам',
            body: [
              'От миссии и стратегии – через командную идентичность, ценности – к мастерству и окружению. Это позволяет двигаться от глубинных смыслов к повседневным практикам.',
              'Читать можно последовательно, а можно открывать нужную главу, когда возник вопрос или потребность свериться с ориентирами.',
            ],
            routeItems: [
              {
                title: 'Добро пожаловать',
                desc: 'Как сегодняшние смыслы определяют завтрашний результат',
                sectionId: 'intro',
                pageId: 'p-ceo',
              },
              {
                title: 'История',
                desc: 'Путь компании и становление культуры',
                sectionId: 'history',
                pageId: 'p-history-break',
              },
              {
                title: 'Миссия и стратегия',
                desc: 'Как личный вклад влияет на глобальные цели и жизнь пациентов',
                sectionId: 'mission',
                pageId: 'p-mission-break',
              },
              {
                title: 'Синергия «МЫ»',
                desc: 'Что помогает понимать друг друга с полуслова',
                sectionId: 'synergy',
                pageId: 'p-synergy-break',
              },
              {
                title: 'Ценности',
                desc: 'Внутренний компас для принятия решений',
                sectionId: 'values',
                pageId: 'p-values-break',
              },
              {
                title: 'Мастерство',
                desc: 'Легендарные победы и секреты успеха',
                sectionId: 'mastery',
                pageId: 'p-mastery-break',
              },
              {
                title: 'Окружение',
                desc: 'Что в компании поддерживает и развивает культуру',
                sectionId: 'environment',
                pageId: 'p-env-break',
              },
              {
                title: 'Практики-тренажеры',
                desc: 'Тренировка мышления на рабочих ситуациях',
                sectionId: 'practice',
                pageId: 'p-practice-break',
              },
            ],
            meta: {
              logo: 'logo/gero_trans_clear.png',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'history',
    number: '02',
    title: 'История ГЕРОФАРМ',
    tag: 'ПУТЬ / КУЛЬТУРА',
    summary: 'Путь компании и становление культуры',
    accent: '#9b4dff',
    paragraphs: [
      {
        id: 'history-break',
        title: 'История ГЕРОФАРМ',
        pages: [
          {
            id: 'p-history-break',
            kind: 'interstitial',
            title: 'ИСТОРИЯ\nГЕРОФАРМ',
            body: [
              'Ключевые вехи становления ГЕРОФАРМ: переломные решения, преодоленные вызовы и смелые идеи, сформировавшие корпоративный характер',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
            },
          },
        ],
      },
      {
        id: 'history-eras',
        title: 'Исторический маршрут',
        pages: [
          {
            id: 'p-history-0',
            kind: 'history-era',
            title: 'История ГЕРОФАРМ',
            meta: { historyPage: '0' },
          },
          {
            id: 'p-history-1',
            kind: 'history-era',
            title: 'История ГЕРОФАРМ',
            meta: { historyPage: '1' },
          },
          {
            id: 'p-history-2',
            kind: 'history-era',
            title: 'История ГЕРОФАРМ',
            meta: { historyPage: '2' },
          },
          {
            id: 'p-history-3',
            kind: 'history-era',
            title: 'История ГЕРОФАРМ',
            meta: { historyPage: '3' },
          },
          {
            id: 'p-history-4',
            kind: 'history-era',
            title: 'История ГЕРОФАРМ',
            meta: { historyPage: '4' },
          },
        ],
      },
    ],
  },
  {
    id: 'mission',
    number: '03',
    title: 'Миссия и стратегия ГЕРОФАРМ',
    tag: 'ГОРИЗОНТ / 2030',
    summary: 'Как личный вклад влияет на глобальные цели и жизнь пациентов',
    accent: '#E56814',
    paragraphs: [
      {
        id: 'mission-break',
        title: 'Миссия и стратегия',
        pages: [
          {
            id: 'p-mission-break',
            kind: 'interstitial',
            title: 'МИССИЯ\nи СТРАТЕГИЯ\nГЕРОФАРМ',
            body: [
              'Миссия — это взгляд за горизонт. Она задает глобальный смысл всей культуре: от ценностей до повседневных решений',
              'Стратегия — маршрут на ближайшие пять лет. Она определяет, как реализовать наше предназначение, превращая ежедневные задачи в реальный вклад в здоровье пациентов',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
            },
          },
        ],
      },
      {
        id: 'mission-pages',
        title: 'Миссия ГЕРОФАРМ',
        pages: [
          {
            id: 'p-mission-statement',
            kind: 'mission-statement',
            title: 'Миссия ГЕРОФАРМ',
          },
          {
            id: 'p-mission-ecosystem',
            kind: 'mission-ecosystem',
            title: 'Экосистема здорового долголетия',
          },
          {
            id: 'p-mission-longevity',
            kind: 'mission-longevity',
            title: 'Мышление долголетия',
          },
          {
            id: 'p-mission-strategy',
            kind: 'mission-strategy-spread',
            title: 'Стратегия 2030',
          },
          {
            id: 'p-mission-strategy-house',
            kind: 'mission-strategy-house',
            title: 'Стратегия 2030 — дом',
          },
        ],
      },
    ],
  },
  {
    id: 'synergy',
    number: '04',
    title: 'Синергия «МЫ» ГЕРОФАРМ',
    tag: 'МИРОВОЗЗРЕНИЕ',
    summary: 'Что помогает понимать друг друга с полуслова',
    accent: '#2C1264',
    paragraphs: [
      {
        id: 'synergy-break',
        title: 'Синергия «МЫ»',
        pages: [
          {
            id: 'p-synergy-break',
            kind: 'interstitial',
            title: 'Синергия\n«МЫ»\nГЕРОФАРМ',
            body: [
              'Уникальность ГЕРОФАРМ — наше мировоззрение. Мы хорошо понимаем друг друга, и это помогает нам быстрее договариваться, увереннее принимать решения и двигаться в одном направлении',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
              theme: 'synergy',
              bg: '#1a0840',
              colors: '#FF9C1B,#FF6B35,#DE56C2,#8B3DFF',
            },
          },
          {
            id: 'p-mission-uniqueness',
            kind: 'mission-uniqueness',
            title: 'Уникальность, которая нас объединяет',
          },
        ],
      },
    ],
  },
  {
    id: 'values',
    number: '05',
    title: 'Ценности ГЕРОФАРМ',
    tag: 'ВНУТРЕННИЙ КОМПАС',
    summary: 'Внутренний компас для принятия решений',
    accent: '#3BB9B8',
    paragraphs: [
      {
        id: 'values-break',
        title: 'Ценности',
        pages: [
          {
            id: 'p-values-break',
            kind: 'interstitial',
            title: 'ЦЕННОСТИ\nГЕРОФАРМ',
            body: [
              'Общая миссия, схожее мировоззрение и единые ценности помогают нам принимать верные решения, действовать согласованно и достигать амбициозных целей. Ценности дают нам ориентир для решений и действий в нестандартных ситуациях, где нет готовых инструкций',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
              theme: 'values',
              bg: '#1a1030',
              colors: '#2A1468,#8A48B8,#3A4EAA,#A24A86',
            },
          },
        ],
      },
      {
        id: 'values-open',
        title: 'Три ценности',
        pages: [
          {
            id: 'p-values-spread',
            kind: 'values-spread',
            title: 'Ценности ГЕРОФАРМ',
          },
          {
            id: 'p-value-ambition',
            kind: 'value-ambition',
            title: 'Амбициозность',
          },
          {
            id: 'p-value-passion',
            kind: 'value-passion',
            title: 'Страсть',
          },
          {
            id: 'p-value-responsibility',
            kind: 'value-responsibility',
            title: 'Ответственность',
          },
        ],
      },
    ],
  },
  {
    id: 'mastery',
    number: '06',
    title: 'Мастерство ГЕРОФАРМ',
    tag: 'ИСТОРИИ ПОБЕД',
    summary: 'Легендарные победы и секреты успеха',
    accent: '#E56814',
    paragraphs: [
      {
        id: 'mastery-break',
        title: 'Мастерство',
        pages: [
          {
            id: 'p-mastery-break',
            kind: 'interstitial',
            title: 'МАСТЕРСТВО\nГЕРОФАРМ',
            body: [
              'Легендарные истории о том, как наша культура реализуется в условиях жестких дедлайнов и высоких рисков, помогая достигать впечатляющих результатов',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
              theme: 'mastery',
              bg: '#3a1430',
              colors: '#FF9C1B,#FF5C3A,#E85A9A,#9B4DFF',
            },
          },
        ],
      },
      {
        id: 'mastery-open',
        title: 'Мастерство в деле',
        pages: [
          {
            id: 'p-mastery-gallery',
            kind: 'mastery-gallery',
            title: 'Галерея историй о мастерстве',
          },
          {
            id: 'p-mastery-semavic',
            kind: 'mastery-semavic',
            title: 'Запуск Семавика: бизнес-контекст',
          },
          {
            id: 'p-mastery-venezuela',
            kind: 'mastery-venezuela',
            title: 'Поставки в Венесуэлу',
          },
          {
            id: 'p-mastery-third-line',
            kind: 'mastery-third-line',
            title: 'Запуск третьей линии',
          },
          {
            id: 'p-mastery-putin',
            kind: 'mastery-putin',
            title: 'Визит Президента',
          },
        ],
      },
    ],
  },
  {
    id: 'environment',
    number: '07',
    title: 'Окружение ГЕРОФАРМ',
    tag: 'ИНФРАСТРУКТУРА КУЛЬТУРЫ',
    summary: 'Что в компании поддерживает и развивает культуру',
    accent: '#2C1264',
    paragraphs: [
      {
        id: 'env-break',
        title: 'Окружение',
        pages: [
          {
            id: 'p-env-break',
            kind: 'interstitial',
            title: 'ОКРУЖЕНИЕ\nГЕРОФАРМ',
            body: [
              'Мы собрали инструменты, которые поддерживают нашу культуру и помогают ей развиваться',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
              theme: 'environment',
              bg: '#0d1a4a',
              colors: '#0081FF,#3D8BFF,#7B3DFF,#A033FF',
            },
          },
        ],
      },
      {
        id: 'env-open',
        title: 'Культурное окружение',
        pages: [
          {
            id: 'p-env-navigator',
            kind: 'env-navigator',
            title: 'Навигатор по культурному окружению',
          },
        ],
      },
    ],
  },
  {
    id: 'practice',
    number: '08',
    title: 'Практики-тренажёры ГЕРОФАРМ',
    tag: 'ТРЕНИРОВКА МЫШЛЕНИЯ',
    summary: 'Тренировка мышления на рабочих ситуациях',
    accent: '#5A44E1',
    paragraphs: [
      {
        id: 'practice-break',
        title: 'Практики-тренажёры',
        pages: [
          {
            id: 'p-practice-break',
            kind: 'interstitial',
            title: 'ПРАКТИКИ\n-ТРЕНАЖЁРЫ\nГЕРОФАРМ',
            body: [
              'Каждая ситуация, разобранная здесь, – это шаг к тому, чтобы мы принимали более точные решения, сохраняя силы и время. Так общая культура повышает нашу эффективность на пути к миссии',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
              theme: 'practice',
              bg: '#2a1a6e',
              colors: '#8BB0F9,#B575F3,#7B5CFF,#5A44E1',
            },
          },
        ],
      },
      {
        id: 'practice-open',
        title: 'Практики',
        pages: [
          {
            id: 'p-practice-gallery',
            kind: 'practice-gallery',
            title: 'Галерея практик-тренажёров',
          },
          {
            id: 'p-practice-equipment',
            kind: 'practice-equipment',
            title: 'Поломка уникального оборудования',
          },
          {
            id: 'p-practice-weeks',
            kind: 'practice-weeks',
            title: 'Недели, которые нельзя потерять',
          },
          {
            id: 'p-practice-error-first',
            kind: 'practice-error-first',
            title: 'Найти ошибку первыми',
          },
          {
            id: 'p-practice-market',
            kind: 'practice-market',
            title: 'Рынок, на котором не торгуются',
          },
          {
            id: 'p-practice-modernization',
            kind: 'practice-modernization',
            title: 'Модернизация линии',
          },
          {
            id: 'p-practice-ai',
            kind: 'practice-ai',
            title: 'Внедрение ИИ',
          },
          {
            id: 'p-practice-long-term',
            kind: 'practice-long-term',
            title: 'Долгосрочное решение',
          },
          {
            id: 'p-practice-methodology',
            kind: 'practice-methodology',
            title: 'Методика: разработать или купить',
          },
          {
            id: 'p-practice-bureaucracy',
            kind: 'practice-bureaucracy',
            title: 'Бюрократические барьеры',
          },
          {
            id: 'p-practice-habits',
            kind: 'practice-habits',
            title: 'Новые привычки',
          },
        ],
      },
      {
        id: 'guide-close',
        title: 'Культурный путеводитель',
        pages: [
          {
            id: 'p-closing-cover',
            kind: 'closing-cover',
            title: 'Культурный путеводитель ГЕРОФАРМ',
          },
        ],
      },
    ],
  },
]

export interface FlatPage {
  page: BookPage
  sectionId: string
  sectionIndex: number
  paragraphId: string
  paragraphTitle: string
  globalIndex: number
  sectionPageIndex: number
  sectionPageCount: number
}

export function flattenPages(secs: Section[] = sections): FlatPage[] {
  const out: FlatPage[] = []
  secs.forEach((section, sectionIndex) => {
    let sectionPageIndex = 0
    const sectionPages = section.paragraphs.flatMap((p) => p.pages)
    const sectionPageCount = sectionPages.length
    section.paragraphs.forEach((paragraph) => {
      paragraph.pages.forEach((page) => {
        out.push({
          page,
          sectionId: section.id,
          sectionIndex,
          paragraphId: paragraph.id,
          paragraphTitle: paragraph.title,
          globalIndex: out.length,
          sectionPageIndex,
          sectionPageCount,
        })
        sectionPageIndex += 1
      })
    })
  })
  return out
}

export const flatPages = flattenPages()
export const totalPages = flatPages.length

/** Sections shown in progress, contents, and menu (excludes preface). */
export const navSections = sections.filter((s) => s.nav !== false)

export function navIndexForSectionId(sectionId: string) {
  return navSections.findIndex((s) => s.id === sectionId)
}
