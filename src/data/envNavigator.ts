export type EnvNavItem = {
  label: string
  desc?: string
  href?: string
}

export type EnvNavAccent = 'orange' | 'violet' | 'rose' | 'blue' | 'coral'

export type EnvNavCard = {
  title: string
  index: string
  accent: EnvNavAccent
  items: EnvNavItem[]
}

export const envNavigator = {
  badge: 'ОКРУЖЕНИЕ ГЕРОФАРМ',
  title: 'Навигатор по культурному окружению',
  intro:
    'Поддерживать и развивать культуру ГЕРОФАРМ помогает наше окружение: сообщество коллег и внутренняя инфраструктура',
  lead: 'Каждый день мы можем использовать возможности, которые компания создаёт для нашего успеха',
  footnote:
    'На странице есть активные ссылки — наведи на пункты в карточках, они открывают внешние ресурсы',
  cards: [
    {
      title: 'История',
      index: '01',
      accent: 'orange',
      items: [
        {
          label: 'Каталог журнала gNEWS (с 2017 по 2025 г.)',
          desc: 'История развития и побед ГЕРОФАРМ',
          href: 'https://academiageropharm.ekvio.ru/430/explorer/7760/folder/1093',
        },
        {
          label: 'Медиатека',
          desc: 'Архив фото и видео бренда',
          href: 'https://academiageropharm.ekvio.ru/430/video',
        },
      ],
    },
    {
      title: 'Миссия и стратегия',
      index: '02',
      accent: 'violet',
      items: [
        {
          label: 'Официальный сайт компании',
          href: 'https://geropharm.ru/',
        },
        {
          label: 'Стратегия 2030 г.',
          href: 'https://hrm.geropharm.com/root/pages/strategy-2030',
        },
        {
          label: 'Дашборды и аналитические системы',
        },
        {
          label: 'Отчетные презентации ГЕРОФАРМ',
          desc: 'Ретроспектива бизнес-результатов',
          href: 'https://academiageropharm.ekvio.ru/430/explorer/7760/folder/1094',
        },
        {
          label: 'Целеполагание',
          desc: 'Модуль на портале для постановки целей',
          href: 'https://hrm.geropharm.com/hrm-goals-management/pages/my-goals',
        },
      ],
    },
    {
      title: 'МЫ — ГЕРОФАРМ',
      index: '03',
      accent: 'rose',
      items: [
        {
          label: 'Корпоративный интернет-портал «СФЕРА»',
          desc: 'Единое пространство для команды',
          href: 'https://hrm.geropharm.com/',
        },
        {
          label: 'ГЕРОФАРМ LIFE',
          desc: 'Канал о событиях корпоративной жизни',
        },
        {
          label: 'Пульс',
          desc: 'Ежегодный опрос вовлечённости',
        },
        {
          label: 'Ежегодный опрос по кросс-функции',
          desc: 'Диагностика взаимодействия между подразделениями',
        },
        {
          label: '«Рекомендуй!»',
          desc: 'Программа рекомендаций коллег',
        },
        {
          label: 'Лига наследия',
          desc: 'Истории и традиции компании',
          href: 'https://hrm.geropharm.com/root/pages/years',
        },
      ],
    },
    {
      title: 'Ценности',
      index: '04',
      accent: 'blue',
      items: [
        {
          label: 'Сообщество амбассадоров',
          desc: 'Носители культуры и ценностей компании',
        },
        {
          label: 'Обратная связь 360',
          desc: 'Развитие через взгляд коллег',
        },
        {
          label: 'Воркшопы по ценностям',
          desc: 'Практика применения ценностей в работе',
        },
        {
          label: 'Игра «Живые ценности»',
          desc: 'Интерактивное погружение в ценности',
        },
        {
          label: 'Благодарность коллеге',
          desc: 'Признание вклада друг друга',
        },
      ],
    },
    {
      title: 'Мастерство',
      index: '05',
      accent: 'coral',
      items: [
        {
          label: 'Академия',
          desc: 'Обучение и развитие сотрудников',
          href: 'https://academiageropharm.ekvio.ru/430/video',
        },
        {
          label: 'Золотая лига',
          desc: 'Программа признания лучших результатов',
          href: 'https://hrm.geropharm.com/root/pages/gold',
        },
        {
          label: 'Серебряная лига',
          desc: 'Мотивация и развитие талантов',
          href: 'https://hrm.geropharm.com/root/pages/motivation',
        },
        {
          label: 'Правила взаимодействия',
          desc: 'Общие нормы работы в команде',
        },
        {
          label: 'Обзор талантов',
          desc: 'Оценка потенциала и карьерные треки',
        },
      ],
    },
  ] satisfies EnvNavCard[],
}
