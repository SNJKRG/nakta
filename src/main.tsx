import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/kurale/cyrillic-400.css'
import '@fontsource/kurale/cyrillic-ext-400.css'
import '@fontsource/kurale/latin-400.css'
import './styles.css'
import Home from './Home'
import MenuPage from './MenuPage'

const root = document.getElementById('root')!
createRoot(root).render(<StrictMode>{root.dataset.page === 'menu' ? <MenuPage /> : <Home />}</StrictMode>)
