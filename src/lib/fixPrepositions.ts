/** Short Russian words that should not end a line alone. */
const SHORT_WORDS = [
  'в',
  'и',
  'с',
  'к',
  'на',
  'по',
  'от',
  'до',
  'за',
  'для',
  'при',
  'из',
  'о',
  'об',
  'не',
  'но',
  'а',
  'же',
  'ли',
  'бы',
  'во',
  'со',
  'ко',
  'мы',
  'у',
  'или',
  'да',
  'ни',
  'под',
  'без',
  'про',
]

const SHORT_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${SHORT_WORDS.join('|')})\\s+(?=[\\p{L}\\p{N}])`,
  'giu',
)

/**
 * Replace the space after short prepositions/conjunctions with a non-breaking space
 * so they stay attached to the following word. Preserves intentional \\n.
 */
export function fixPrepositions(text: string): string {
  if (!text) return text
  return text.replace(SHORT_RE, (_, word: string) => `${word}\u00A0`)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Split text into plain / highlight chunks (after applying non-breaking spaces).
 * Longer phrases are matched first.
 */
export function splitHighlighted(
  text: string,
  phrases: string[],
): Array<{ text: string; highlight: boolean }> {
  const fixed = fixPrepositions(text)
  if (!phrases.length) return [{ text: fixed, highlight: false }]

  const sorted = [...phrases].sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'gi')
  const parts = fixed.split(pattern)

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: sorted.some((phrase) => phrase.toLowerCase() === part.toLowerCase()),
    }))
}
