export type PracticeGalleryCard = {
  id: string
  pageId: string
  title: string
  gradient: string
}

export const practiceGallery = {
  badge: 'ПРАКТИКИ ГЕРОФАРМ',
  instruction:
    'Крути колесо левой кнопкой или колесом мыши, чтобы выбрать историю',
  cards: [
    {
      id: 'equipment',
      pageId: 'p-practice-equipment',
      title: 'Поломка уникального оборудования',
      gradient: 'linear-gradient(160deg, #0f172a 0%, #f97316 45%, #fb923c 100%)',
    },
    {
      id: 'weeks',
      pageId: 'p-practice-weeks',
      title: 'Недели, которые нельзя потерять',
      gradient: 'linear-gradient(160deg, #111827 0%, #ec4899 48%, #f472b6 100%)',
    },
    {
      id: 'error-first',
      pageId: 'p-practice-error-first',
      title: 'Найти ошибку первыми',
      gradient: 'linear-gradient(160deg, #0b1220 0%, #8b5cf6 46%, #a78bfa 100%)',
    },
    {
      id: 'market',
      pageId: 'p-practice-market',
      title: 'Рынок, на котором не торгуются',
      gradient: 'linear-gradient(160deg, #0f172a 0%, #3b82f6 48%, #60a5fa 100%)',
    },
    {
      id: 'modernization',
      pageId: 'p-practice-modernization',
      title: 'Модернизация линии',
      gradient: 'linear-gradient(160deg, #111827 0%, #14b8a6 48%, #2dd4bf 100%)',
    },
    {
      id: 'ai',
      pageId: 'p-practice-ai',
      title: 'Внедрение ИИ',
      gradient: 'linear-gradient(160deg, #0b1020 0%, #6366f1 46%, #818cf8 100%)',
    },
    {
      id: 'long-term',
      pageId: 'p-practice-long-term',
      title: 'Долгосрочное решение',
      gradient: 'linear-gradient(160deg, #0f172a 0%, #e11d48 48%, #fb7185 100%)',
    },
    {
      id: 'methodology',
      pageId: 'p-practice-methodology',
      title: 'Методика: разработать или купить',
      gradient: 'linear-gradient(160deg, #111827 0%, #d97706 48%, #fbbf24 100%)',
    },
    {
      id: 'bureaucracy',
      pageId: 'p-practice-bureaucracy',
      title: 'Бюрократические барьеры',
      gradient: 'linear-gradient(160deg, #0b1220 0%, #7c3aed 46%, #c084fc 100%)',
    },
    {
      id: 'habits',
      pageId: 'p-practice-habits',
      title: 'Новые привычки',
      gradient: 'linear-gradient(160deg, #0f172a 0%, #059669 48%, #34d399 100%)',
    },
  ] satisfies PracticeGalleryCard[],
}

export const practiceStoryPageIds = practiceGallery.cards.map((c) => c.pageId)

export const practiceGalleryPageId = 'p-practice-gallery'
