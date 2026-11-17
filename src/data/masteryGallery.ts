export type MasteryGalleryCard = {
  id: string
  pageId: string
  title: string
  tone: string
  cover: string
}

export const masteryGallery = {
  badge: 'МАСТЕРСТВО ГЕРОФАРМ',
  title: 'Истории о мастерстве',
  instruction: 'Выбери историю про мастерство ГЕРОФАРМ',
  cards: [
    {
      id: 'semavic',
      pageId: 'p-mastery-semavic',
      title: 'Запуск Семавика: понимать бизнес и управлять результатом',
      tone: '#f97316',
      cover: 'img/masterstvo/semavic.jpg',
    },
    {
      id: 'venezuela',
      pageId: 'p-mastery-venezuela',
      title: 'Поставки в Венесуэлу: кросс-функциональная синергия',
      tone: '#ec4899',
      cover: 'img/masterstvo/venezuela.jpg',
    },
    {
      id: 'third-line',
      pageId: 'p-mastery-third-line',
      title: 'Запуск третьей линии: профессиональное упорство',
      tone: '#8b5cf6',
      cover: 'img/masterstvo/third-line.jpg',
    },
    {
      id: 'putin',
      pageId: 'p-mastery-putin',
      title: 'Визит президента В.В. Путина: командная победа',
      tone: '#3b82f6',
      cover: 'img/masterstvo/putin.jpg',
    },
  ] satisfies MasteryGalleryCard[],
}

/** Story page ids in gallery order */
export const masteryStoryPageIds = masteryGallery.cards.map((c) => c.pageId)

export const masteryGalleryPageId = 'p-mastery-gallery'
