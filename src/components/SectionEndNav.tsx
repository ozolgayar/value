import { createContext, useContext, type ReactNode } from 'react'

const SectionEndNavContext = createContext<ReactNode>(null)

export function SectionEndNavProvider({
  value,
  children,
}: {
  value: ReactNode
  children: ReactNode
}) {
  return (
    <SectionEndNavContext.Provider value={value}>
      {children}
    </SectionEndNavContext.Provider>
  )
}

/** Render inside the page surface that owns the background. */
export function SectionEndNav() {
  const node = useContext(SectionEndNavContext)
  if (!node) return null
  return <>{node}</>
}
