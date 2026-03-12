import { Suspense, lazy, useState } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion'
import AuroraBackground from './components/layout/AuroraBackground'
import Navbar from './components/layout/Navbar'
import AdminSidebar from './components/layout/AdminSidebar'
import AdminTopBar from './components/layout/AdminTopBar'
import { useAuth } from './contexts/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Track = lazy(() => import('./pages/Track'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Parcels = lazy(() => import('./pages/admin/Parcels'))
const CreateShipment = lazy(() => import('./pages/admin/CreateShipment'))
const UpdateTracking = lazy(() => import('./pages/admin/UpdateTracking'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 rounded-full"
        style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

function PublicLayout() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

function AdminLayout() {
  const { token } = useAuth()
  const location = useLocation()
  const [sidebarWidth, setSidebarWidth] = useState(240)
  if (!token) return <Navigate to="/admin/login" replace />
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <AdminSidebar onCollapse={(c) => setSidebarWidth(c ? 72 : 240)} />
      {/* Animated spacer to offset fixed sidebar on desktop */}
      <motion.div
        className="hidden md:block shrink-0"
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const prefersReduced = useReducedMotion()
  return (
    <MotionConfig reducedMotion={prefersReduced ? 'always' : 'never'}>
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="track" element={<Track />} />
      </Route>

      {/* Admin auth */}
      <Route path="admin/login" element={
        <div className="relative min-h-screen">
          <AuroraBackground />
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        </div>
      } />

      {/* Admin protected */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="parcels" element={<Parcels />} />
        <Route path="create" element={<CreateShipment />} />
        <Route path="tracking" element={<UpdateTracking />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div className="relative min-h-screen">
          <AuroraBackground />
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        </div>
      } />
    </Routes>
    </MotionConfig>
  )
}
