import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'

const VALUE_ICONS: Record<string, string> = {
  АМБИЦИОЗНОСТЬ: 'img/11.png',
  СТРАСТЬ: 'img/12.png',
  ОТВЕТСТВЕННОСТЬ: 'img/13.png',
}

export function MasteryValueRow({
  name,
  text,
}: {
  name: string
  text: string
}) {
  const icon = VALUE_ICONS[name]

  return (
    <p className="ms__rc-value">
      {icon ? (
        <img
          className="ms__value-icon"
          src={asset(icon)}
          alt=""
          aria-hidden
          draggable={false}
        />
      ) : (
        <span className="ms__value-term">{name}</span>
      )}
      <span className="ms__value-text">{fixPrepositions(text)}</span>
    </p>
  )
}
