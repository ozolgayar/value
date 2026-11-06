export type BingoValue = 'ambition' | 'passion' | 'responsibility'

export type BingoTile = {
  id: string
  text: string
  value: BingoValue
}

export type BingoResultProfile = {
  id: string
  tag: string
  name: string
  body: string
  disclaimer: string
  icon: string
  accent: BingoValue | 'balanced' | 'spark'
}

export const cultureBingo = {
  title: 'Сыграем в культурное БИНГО?',
  subtitle:
    'Отметь ситуации, которые случались с тобой за последний месяц. Ты сможешь увидеть, как культура воплощается в повседневной работе.',
  cta: 'Узнать результат',
  replay: 'Сыграть ещё раз',
  tiles: [
    {
      id: 't1',
      text: 'Поставил цель, которая казалась слишком глобальной — и достиг её',
      value: 'ambition',
    },
    {
      id: 't2',
      text: 'Взялся за задачу, за которую никто не хотел браться',
      value: 'ambition',
    },
    {
      id: 't3',
      text: 'Признал ошибку и предложил, как её исправить',
      value: 'responsibility',
    },
    {
      id: 't4',
      text: 'Освоил новый подход и поделился им с коллегами',
      value: 'passion',
    },
    {
      id: 't5',
      text: 'Применил ИИ или новую технологию там, где раньше делали «по старинке»',
      value: 'ambition',
    },
    {
      id: 't6',
      text: 'Остановил работу, заметив отклонение от стандартов качества',
      value: 'responsibility',
    },
    {
      id: 't7',
      text: 'Прошёл обучение в Академии ГЕРОФАРМ по собственной инициативе',
      value: 'passion',
    },
    {
      id: 't8',
      text: 'Нашёл способ достичь цели, когда все говорили «невозможно»',
      value: 'ambition',
    },
    {
      id: 't9',
      text: 'Доделал задачу до конца, хотя хотелось бросить',
      value: 'responsibility',
    },
    {
      id: 't10',
      text: 'Предложил идею, которая улучшила рабочий процесс',
      value: 'ambition',
    },
    {
      id: 't11',
      text: 'Подбадривал коллег в напряжённый период — и изменил настрой',
      value: 'passion',
    },
    {
      id: 't12',
      text: 'Выполнил обещание коллеге, даже когда было сложно',
      value: 'responsibility',
    },
    {
      id: 't13',
      text: 'Поставил цель, требующую новых знаний — и начал двигаться к ней',
      value: 'passion',
    },
    {
      id: 't14',
      text: 'Предложил коллегам пообщаться вне работы — и узнал их с новой стороны',
      value: 'passion',
    },
    {
      id: 't15',
      text: 'Открыто сообщил о проблеме и предложил решение',
      value: 'responsibility',
    },
    {
      id: 't16',
      text: 'Помог коллеге, хотя сам был сильно загружен',
      value: 'passion',
    },
    {
      id: 't17',
      text: 'Выполнил задачу с опережением срока, превзойдя ожидания',
      value: 'ambition',
    },
    {
      id: 't18',
      text: 'Запросил обратную связь и учёл её в работе',
      value: 'responsibility',
    },
  ] satisfies BingoTile[],
}

const PROFILES: Record<string, BingoResultProfile> = {
  spark: {
    id: 'spark',
    tag: 'СТАРТ',
    name: 'Искра культуры',
    body: 'Ты уже замечаешь, где ценности ГЕРОФАРМ появляются в работе. Отметь больше ситуаций в следующем месяце — и увидишь, как привычки складываются в общий стиль команды.',
    disclaimer: '*Описание носит игровой характер и помогает заметить проявления ценностей.',
    icon: 'img/11.png',
    accent: 'spark',
  },
  ambition: {
    id: 'ambition',
    tag: 'АМБИЦИОЗНОСТЬ',
    name: 'Архитектор дерзких целей',
    body: 'Ты берёшься за сложное, ищешь новые возможности и не останавливаешься на привычном. В команде ты задаёшь планку: «можно дальше и смелее» — и находишь путь, даже когда другие сомневаются.',
    disclaimer: '*Описание носит игровой характер и помогает заметить проявления ценностей.',
    icon: 'img/11.png',
    accent: 'ambition',
  },
  passion: {
    id: 'passion',
    tag: 'СТРАСТЬ',
    name: 'Источник драйва команды',
    body: 'Ты заряжаешь окружающих энергией, делишься знаниями и превращаешь трудности в движение. Рядом с тобой легче учиться, пробовать новое и верить, что результат возможен.',
    disclaimer: '*Описание носит игровой характер и помогает заметить проявления ценностей.',
    icon: 'img/12.png',
    accent: 'passion',
  },
  responsibility: {
    id: 'responsibility',
    tag: 'ОТВЕТСТВЕННОСТЬ',
    name: 'Хранитель качества и слова',
    body: 'Ты доводишь дело до конца, открыто говоришь о рисках и держишь обещания. На тебя можно опереться: безопасность пациентов, стандарты и договорённости для тебя не лозунги, а ежедневная практика.',
    disclaimer: '*Описание носит игровой характер и помогает заметить проявления ценностей.',
    icon: 'img/13.png',
    accent: 'responsibility',
  },
  balanced: {
    id: 'balanced',
    tag: 'СИНЕРГИЯ ЦЕННОСТЕЙ',
    name: 'Живое воплощение культуры ГЕРОФАРМ',
    body: 'В твоей работе звучат все три ценности: дерзкие цели, драйв и надёжность. Ты показываешь, как культура становится не плакатом, а способом принимать решения каждый день.',
    disclaimer: '*Описание носит игровой характер и помогает заметить проявления ценностей.',
    icon: 'logo/trans-mark-only.png',
    accent: 'balanced',
  },
}

export function scoreBingo(selectedIds: ReadonlySet<string>) {
  const total = cultureBingo.tiles.length
  const selected = cultureBingo.tiles.filter((tile) => selectedIds.has(tile.id))
  const count = selected.length

  const tallies: Record<BingoValue, number> = {
    ambition: 0,
    passion: 0,
    responsibility: 0,
  }
  for (const tile of selected) {
    tallies[tile.value] += 1
  }

  const ranked = (Object.entries(tallies) as [BingoValue, number][]).sort(
    (a, b) => b[1] - a[1],
  )
  const [topValue, topCount] = ranked[0]
  const secondCount = ranked[1]?.[1] ?? 0
  const spread = topCount - secondCount

  let profile: BingoResultProfile
  if (count <= 4) {
    profile = PROFILES.spark
  } else if (count >= 12 && spread <= 1) {
    profile = PROFILES.balanced
  } else if (topCount === 0) {
    profile = PROFILES.spark
  } else {
    profile = PROFILES[topValue]
  }

  let summary: string
  if (count === 0) {
    summary =
      'Пока без отметок — это тоже точка старта. Вернись к полю и отметь то, что уже случалось: культура начинается с маленьких действий.'
  } else if (count <= 4) {
    summary =
      'Ты уже ловишь отдельные проявления культуры. Чем чаще такие ситуации становятся привычкой, тем заметнее общий стиль ГЕРОФАРМ.'
  } else if (count <= 10) {
    summary =
      'Культура для тебя — не абстракция: ты регулярно проживаешь ценности в рабочих ситуациях. Есть запас, чтобы усилить и другие грани.'
  } else if (count <= 15) {
    summary =
      'Ты уверенно воплощаешь культуру в повседневности. Коллеги рядом с тобой видят, как ценности превращаются в решения и поступки.'
  } else {
    summary =
      'Почти полный бинго: ты живёшь ценностями ГЕРОФАРМ каждый день. Таким примером культура передаётся быстрее любых презентаций.'
  }

  return { count, total, tallies, profile, summary }
}
