export type EcoLink = {
  label: string
  href?: string
  kind?: 'logo' | 'chip'
}

export type EcoBlock = {
  title: string
  text: string
  links?: EcoLink[]
}

export const missionStatement = {
  badge: 'МИССИЯ ГЕРОФАРМ',
  title: 'СОЗДАЕМ ИННОВАЦИИ ДЛЯ УВЕЛИЧЕНИЯ ПРОДОЛЖИТЕЛЬНОСТИ ЖИЗНИ В РОССИИ И В МИРЕ',
  body: [
    'ГЕРОФАРМ — биотехнологическая компания, которая выводит Россию в лидеры по продолжительности активной жизни.',
    'Более 25 лет мы разрабатываем и производим жизненно важные лекарства и выступаем надежным партнером государства в лечении социально значимых заболеваний.',
    'Многолетняя экспертиза в создании препаратов для терапии социально значимых заболеваний и реализация инициатив в соответствующих направлениях вносит значительный вклад в формирование культуры здорового долголетия.',
  ],
  highlight: 'культуры здорового долголетия',
  photo: 'img/04.jpg',
  logo: 'logo/trans-mark-only.png',
}

export const missionEcosystem = {
  badge: 'МИССИЯ ГЕРОФАРМ',
  title: 'ГЕРОФАРМ в экосистеме\nЗДОРОВОГО ДОЛГОЛЕТИЯ 360°',
  left: [
    {
      title: 'Метаболическое здоровье',
      text: 'Мы боремся с предрисками, которые запускают старение: ожирение и лишний вес.',
      links: [
        { label: 'ОРБИТА', kind: 'logo' as const },
        { label: 'Stroynee', kind: 'logo' as const },
        { label: '«Ничего лишнего»', kind: 'chip' as const },
      ],
    },
    {
      title: 'Репродуктивное долголетие',
      text: 'Мы поддерживаем активность и достоинство пациентов, корректируя возрастные изменения и предотвращая патологии.',
    },
    {
      title: 'Сахарный диабет',
      text: 'Мы создаем инсулин и среду для полноценной жизни с диабетом. Мы рядом с пациентом с момента постановки диагноза.',
      links: [
        { label: 'диабет в лицах', kind: 'logo' as const },
        { label: '«Лисена-сластена»', kind: 'chip' as const },
        { label: '«5 оттенков красоты»', kind: 'chip' as const },
      ],
    },
  ] as EcoBlock[],
  right: [
    {
      title: 'Ментальное здоровье',
      text: 'Мы защищаем нейронные сети и помогаем сохранять ментальную независимость в любом возрасте.',
      links: [
        { label: 'ПРОМОЗГ', kind: 'chip' as const },
        { label: 'СПЕКТРОГРАММА', kind: 'chip' as const },
      ],
    },
    {
      title: 'Партнерство',
      text: 'Мы растем вместе с профессиональным сообществом и внедряем цифровые решения.',
      links: [{ label: '«Врач будущего»', kind: 'chip' as const }],
    },
  ] as EcoBlock[],
  note: 'На странице есть активные ссылки: при клике/нажатии они ведут на внешние ресурсы',
  logo: 'logo/trans-mark-only.png',
}

export const missionLongevity = {
  badge: 'МИССИЯ ГЕРОФАРМ',
  title: 'МЫШЛЕНИЕ ДОЛГОЛЕТИЯ:\nпродлеваем жизнь другим, начиная с себя',
  body: [
    'Проект «Мышление долголетия» помогает команде формировать привычки активного долголетия и осознанно относиться к собственному здоровью.',
    'Мы объединяем спортивные активности и полезные инициативы, чтобы здоровье и непрерывное развитие стали частью повседневной жизни.',
  ],
  items: [
    { icon: 'water', label: 'Фокус на здоровье' },
    { icon: 'sport', label: 'Спорт и физическая активность' },
    { icon: 'learn', label: 'Непрерывное обучение' },
    { icon: 'pro', label: 'Профессиональное развитие' },
    { icon: 'social', label: 'Социальные связи' },
    { icon: 'motive', label: 'Мотивация к успеху' },
  ],
  hashtag: '#МЫШЛЕНИЕ_ДОЛГОЛЕТИЯ',
  logo: 'logo/trans-mark-only.png',
}

/** @deprecated kept for compatibility */
export const missionEcoLeft = missionStatement
export const missionEcoRight = {
  badge: missionEcosystem.badge,
  title: missionEcosystem.title,
  blocks: [...missionEcosystem.left, ...missionEcosystem.right],
  note: missionEcosystem.note,
  logo: missionEcosystem.logo,
  columns: [missionEcosystem.left.slice(0, 2), [...missionEcosystem.left.slice(2), ...missionEcosystem.right]],
}
