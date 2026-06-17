import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './context/ContentProvider'
import { LocaleProvider } from './context/LocaleProvider'
import SeoHead from './components/SeoHead'
import HomePage from './pages/HomePage'
import AlbumPage from './pages/AlbumPage'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return <div className="min-h-screen bg-ink" aria-hidden />
}

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <ContentProvider>
          <SeoHead />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/portfolio/:id" element={<AlbumPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ContentProvider>
      </BrowserRouter>
    </LocaleProvider>
  )
}
