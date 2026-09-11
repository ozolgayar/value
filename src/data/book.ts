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
}

export const BOOK_META = {
  title: 'Культурный путеводитель ГЕРОФАРМ',
  hashtag: '#КОМПАНИЮ_МЕНЯЮТ_ЛЮДИ',
  badge: 'ГЕРОФАРМ · ТРАНСФОРМАЦИЯ',
  subtitle: 'Восемь разделов о корпоративной культуре ГЕРОФАРМ',
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
              'ГЕРОФАРМ отмечает 25 лет. Это хороший повод оценить пройденный путь и заглянуть в будущее. Мир меняется быстрее, чем когда-либо. Чтобы оставаться лидерами важно постоянно учиться, адаптироваться и двигаться вперед.',
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
              'Мы работаем в отрасли, где каждое решение влияет на здоровье пациентов, развитие отечественной медицины и фармацевтический суверенитет страны. Поэтому важно понимать как свои задачи, так и видеть общую бизнес-картину.',
              '«За кадром» осталось ещё много историй, традиций, полезных инструментов — они войдут в продолжение нашего путеводителя.',
            ],
            sideTitle: 'Этот путеводитель поможет:',
            sideItems: [
              'Скоординировать ежедневную работу со стратегией',
              'Сделать верный выбор в неоднозначной ситуации',
              'Руководителям — выстраивать команду на основе единых смыслов',
              'Новым сотрудникам — быстрее погрузиться в жизнь компании',
              'Опытным коллегам — увидеть новое в привычных вещах',
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
                title: 'История',
                desc: 'Путь компании и становление культуры',
                sectionId: 'history',
                pageId: 'p-history-0',
              },
              {
                title: 'Миссия и стратегия',
                desc: 'Как личный вклад влияет на глобальные цели и жизнь пациентов',
                sectionId: 'mission',
              },
              {
                title: 'Синергия «МЫ»',
                desc: 'Что помогает понимать друг друга с полуслова',
                sectionId: 'synergy',
              },
              {
                title: 'Ценности',
                desc: 'Внутренний компас для принятия решений',
                sectionId: 'values',
              },
              {
                title: 'Мастерство',
                desc: 'Легендарные победы и секреты успеха',
                sectionId: 'mastery',
              },
              {
                title: 'Окружение',
                desc: 'Что в компании поддерживает и развивает культуру',
                sectionId: 'environment',
              },
              {
                title: 'Практики-тренажеры',
                desc: 'Тренировка мышления на рабочих ситуациях',
                sectionId: 'practice',
              },
            ],
            meta: {
              logo: 'logo/gero_trans_clear.png',
            },
          },
        ],
      },
      {
        id: 'history-break',
        title: 'История ГЕРОФАРМ',
        pages: [
          {
            id: 'p-history-break',
            kind: 'interstitial',
            title: 'ИСТОРИЯ\nГЕРОФАРМ',
            body: [
              'Мы отправляемся по историческому маршруту: ключевым вехам становления ГЕРОФАРМ. Переломные решения, преодоленные вызовы и смелые идеи, сформировавшие корпоративный характер.',
            ],
            meta: {
              logo: 'logo/trans-mark-only.png',
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
      {
        id: 'mission-break',
        title: 'Миссия и стратегия',
        pages: [
          {
            id: 'p-mission-break',
            kind: 'interstitial',
            title: 'МИССИЯ\nи СТРАТЕГИЯ\nГЕРОФАРМ',
            body: [
              'Миссия — это взгляд за горизонт. Она задает глобальный смысл всей культуре: от ценностей до повседневных решений.',
              'Стратегия — маршрут на ближайшие пять лет. Она определяет, как реализовать наше предназначение, превращая ежедневные задачи в реальный вклад в здоровье пациентов.',
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
          // Single spread: left (blue) + right (white) on one screen — do not duplicate
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
        ],
      },
      {
        id: 'facts',
        title: 'ГЕРОФАРМ в цифрах',
        pages: [
          {
            id: 'p-facts',
            kind: 'facts',
            badge: 'ГЕРОФАРМ В ЦИФРАХ',
            title: 'Масштаб, который создают люди',
            body: [
              'За этими цифрами — ежедневная работа команды, которая меняет жизнь пациентов к лучшему.',
            ],
            facts: [
              { value: 25, label: 'лет' },
              { value: 70, suffix: '+', label: 'стран' },
              { value: 2500, suffix: '+', label: 'сотрудников' },
            ],
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
        id: 'mission-open',
        title: 'Миссия и стратегия',
        pages: [
          {
            id: 'p-mission-open',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 03',
            title: 'Миссия и стратегия',
            body: [
              'Миссия — взгляд за горизонт. Она задает глобальный смысл всей культуре: от ценностей до повседневных решений. Стратегия — маршрут на ближайшие пять лет.',
            ],
          },
          {
            id: 'p-mission',
            kind: 'quote',
            badge: 'МИССИЯ ГЕРОФАРМ',
            quote:
              'ГЕРОФАРМ — биотехнологическая компания, которая выводит Россию в лидеры по продолжительности активной жизни.',
            body: [
              'Более 25 лет мы разрабатываем и производим жизненно важные лекарства и выступаем надежным партнером государства в лечении социально значимых заболеваний.',
            ],
          },
          {
            id: 'p-strategy-role',
            kind: 'text',
            badge: 'ВАША РОЛЬ',
            title: 'Стратегия работает, когда каждый понимает',
            body: [
              'Как его задачи влияют на общие цели.',
              'Какие решения он принимает с учетом долгосрочных последствий.',
              'Какую ответственность он несет за результат.',
            ],
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
        id: 'synergy-open',
        title: 'Синергия «МЫ»',
        pages: [
          {
            id: 'p-synergy',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 04',
            title: 'Синергия «МЫ»',
            body: [
              'Уникальность ГЕРОФАРМ — наше мировоззрение. Мы хорошо понимаем друг друга, и это помогает быстрее договариваться, увереннее принимать решения и двигаться в одном направлении.',
            ],
          },
          {
            id: 'p-synergy-traits',
            kind: 'text',
            badge: 'НАШ ХАРАКТЕР',
            title: 'Мы смело мыслим на долгие годы вперед',
            body: [
              'Предвосхищаем запросы пациентов и формируем будущее фармацевтической отрасли.',
              'Ставим долгосрочные цели, создаем комплексные стратегии и непрерывно развиваемся.',
              'Нас объединяет мышление долголетия.',
            ],
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
        id: 'values-open',
        title: 'Три ценности',
        pages: [
          {
            id: 'p-values-open',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 05',
            title: 'Ценности ГЕРОФАРМ',
            body: [
              'Мы команда с общей миссией и схожим мировоззрением. Мы выбрали три ключевые ценности, которые помогают интуитивно принимать верные решения там, где нет готовых инструкций.',
            ],
          },
          {
            id: 'p-values-three',
            kind: 'values',
            badge: 'НАШИ ЦЕННОСТИ',
            title: 'Амбициозность · Страсть · Ответственность',
            values: [
              {
                name: 'Амбициозность',
                desc: 'Открываем возможности, ставим дерзкие цели и берёмся за сложные задачи. Мы устремлены в будущее.',
                color: '#E56814',
              },
              {
                name: 'Страсть',
                desc: 'Увлечены работой, преодолеваем трудности и создаём атмосферу драйва вокруг инноваций.',
                color: '#3BB9B8',
              },
              {
                name: 'Ответственность',
                desc: 'Доводим начатое до результата и выполняем взятые на себя обязательства перед пациентами и командой.',
                color: '#2C1264',
              },
            ],
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
        id: 'mastery-open',
        title: 'Мастерство в деле',
        pages: [
          {
            id: 'p-mastery',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 06',
            title: 'Мастерство',
            body: [
              'Легендарные истории о том, как наша культура реализуется в условиях жестких дедлайнов и высоких рисков, помогая достигать впечатляющих результатов.',
            ],
          },
          {
            id: 'p-semavic',
            kind: 'text',
            badge: 'ТВОРЧЕСТВО В ЦИФРАХ',
            title: 'Запуск Семавика',
            body: [
              'История началась, когда поставки критически важного препарата оказались под угрозой. Команда увидела бизнес-контекст и управляла результатом до запуска решения для пациентов.',
              'В этой истории ярко проявились амбициозность, страсть и ответственность — цель без оглядки на прецеденты, работа до результата и решения с пониманием последствий.',
            ],
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
        id: 'env-open',
        title: 'Культурное окружение',
        pages: [
          {
            id: 'p-env',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 07',
            title: 'Окружение',
            body: [
              'Мы собрали инструменты, которые поддерживают нашу культуру и помогают ей развиваться: сообщество коллег и внутренняя инфраструктура.',
            ],
          },
          {
            id: 'p-env-tools',
            kind: 'text',
            badge: 'НАВИГАТОР',
            title: 'Что рядом с вами',
            body: [
              'Корпоративный портал «СФЕРА» — единое пространство для команды.',
              'ГЕРОФАРМ LIFE — канал о событиях корпоративной жизни.',
              '«Пульс» — ежегодный опрос вовлеченности.',
              'Программа «Рекомендуй!» и другие практики синергии «Мы».',
            ],
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
    accent: '#3BB9B8',
    paragraphs: [
      {
        id: 'practice-open',
        title: 'Практики',
        pages: [
          {
            id: 'p-practice',
            kind: 'section-open',
            badge: 'РАЗДЕЛ 08',
            title: 'Практики-тренажёры',
            body: [
              'Каждая ситуация — шаг к тому, чтобы в работе делать меньше ошибок, сохранять силы и время. Так общая культура делает нас эффективнее для реализации миссии.',
            ],
          },
          {
            id: 'p-practice-example',
            kind: 'text',
            badge: 'ПРИМЕР',
            title: 'Поломка уникального оборудования',
            body: [
              'На линии розлива вышла из строя уникальная деталь. Поставка новой — три месяца. Лучший выбор по ценностям: найти локального поставщика, снизить зависимость от импорта, погрузиться в технические детали и не рисковать качеством.',
            ],
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
