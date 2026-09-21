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
  'у',
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
