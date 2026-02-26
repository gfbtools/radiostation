import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArtistProfile from './pages/ArtistProfile'

createRoot(document.getElementById('artist-root')!).render(
  <StrictMode>
    <ArtistProfile />
  </StrictMode>,
)
