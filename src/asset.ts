/** Public asset path that respects Vite `base` (needed for GitHub Pages). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\//, '')}`
}
