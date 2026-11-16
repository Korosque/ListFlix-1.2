import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CatalogProvider } from './context/CatalogContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { Catalog } from './pages/Catalog'
import { Details } from './pages/Details'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Watchlist } from './pages/Watchlist'

function RequireAuth({ children }: { children: JSX.Element }) {
  return useAuth().user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <WatchlistProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/inicio" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/minha-lista" element={<Watchlist />} />
              <Route path="/filme/:id" element={<Details />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WatchlistProvider>
      </CatalogProvider>
    </AuthProvider>
  )
}
