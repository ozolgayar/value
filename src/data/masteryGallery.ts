export type MasteryGalleryCard = {
  id: string
  pageId: string
  title: string
  tone: string
}

export const masteryGallery = {
  badge: 'МАСТЕРСТВО ГЕРОФАРМ',
  title: 'Истории о мастерстве',
  instruction: 'Выбери историю про мастерство ГЕРОФАРМ',
  cards: [
    {
      id: 'semavic',
      pageId: 'p-mastery-semavic',
      title: 'Запуск Семавика',
      tone: '#f97316',
    },
    {
      id: 'venezuela',
      pageId: 'p-mastery-venezuela',
      title: 'Поставки в Венесуэлу',
      tone: '#ec4899',
    },
    {
      id: 'third-line',
      pageId: 'p-mastery-third-line',
      title: 'Запуск третьей линии',
      tone: '#8b5cf6',
    },
    {
      id: 'putin',
      pageId: 'p-mastery-putin',
      title: 'Визит Президента',
      tone: '#3b82f6',
    },
  ] satisfies MasteryGalleryCard[],
}

/** Story page ids in gallery order */
export const masteryStoryPageIds = masteryGallery.cards.map((c) => c.pageId)

export const masteryGalleryPageId = 'p-mastery-gallery'
