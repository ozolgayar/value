import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { asset } from './asset'

const rootStyle = document.documentElement.style
rootStyle.setProperty('--asset-cover', `url(${asset('img/01.jpg')})`)
rootStyle.setProperty('--asset-trans-mark', `url(${asset('logo/trans-mark-only.png')})`)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

