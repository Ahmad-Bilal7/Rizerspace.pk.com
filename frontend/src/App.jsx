import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { toastOptions } from './utils/toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'

// Lazy-loaded pages
const Home           = lazy(() => import('./pages/Home'))
const Catalog        = lazy(() => import('./pages/Catalog'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart           = lazy(() => import('./pages/Cart'))
const Checkout       = lazy(() => import('./pages/Checkout'))
const OrderHistory   = lazy(() => import('./pages/OrderHistory'))
const OrderTracking  = lazy(() => import('./pages/OrderTracking'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const Profile        = lazy(() => import('./pages/Profile'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts  = lazy(() => import('./pages/admin/Products'))
const AdminOrders    = lazy(() => import('./pages/admin/Orders'))
const AdminCoupons   = lazy(() => import('./pages/admin/Coupons'))

// Info pages
const AboutUs        = lazy(() => import('./pages/AboutUs'))
const FAQ            = lazy(() => import('./pages/FAQ'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const Returns        = lazy(() => import('./pages/Returns'))

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
    <div style={{ width: 48, height: 48, border: '3px solid #e50914', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<Home />} />
          <Route path="/catalog"         element={<Catalog />} />
          <Route path="/product/:id"     element={<ProductDetails />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile"       element={<Profile />} />
            <Route path="/cart"          element={<Cart />} />
            <Route path="/checkout"      element={<Checkout />} />
            <Route path="/orders"        element={<OrderHistory />} />
            <Route path="/orders/:id"    element={<OrderTracking />} />
          </Route>

          {/* Info pages */}
          <Route path="/about"    element={<AboutUs />} />
          <Route path="/faq"      element={<FAQ />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns"  element={<Returns />} />

          {/* Admin — redirect /admin → /admin/dashboard */}
          <Route element={<AdminRoute />}>
            <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products"  element={<AdminProducts />} />
            <Route path="/admin/orders"    element={<AdminOrders />} />
            <Route path="/admin/coupons"   element={<AdminCoupons />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}
