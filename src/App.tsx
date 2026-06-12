import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './context/ContentProvider'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ContentProvider>
              <HomePage />
            </ContentProvider>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
