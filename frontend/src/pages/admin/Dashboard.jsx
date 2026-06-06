import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Users, Package, Tag, TrendingUp,
  Clock, CheckCircle, Truck, XCircle, CreditCard, ArrowRight
} from 'lucide-react'
import api from '../../services/api'
import AdminNav from '../../components/AdminNav'

const StatCard = ({ icon: Icon, label, value, sub, color = '#e50914', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{
      background: '#111', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      {sub && <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>{sub}</span>}
    </div>
    <div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'monospace' }}>{value}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>{label}</p>
    </div>
  </motion.div>
)

export default function AdminDashboard() {
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders').then(r => r.data.data),
    refetchInterval: 30000
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products?limit=100').then(r => r.data.data),
  })

  const orders   = ordersData || []
  const products = productsData || []

  // Derived stats
  const totalRevenue    = orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.totalAmount, 0)
  const pendingOrders   = orders.filter(o => o.orderStatus === 'Pending').length
  const confirmedOrders = orders.filter(o => o.orderStatus === 'Confirmed').length
  const shippedOrders   = orders.filter(o => o.orderStatus === 'Shipped').length
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length
  const pendingPayments = orders.filter(o => o.paymentStatus === 'Pending' && ['JazzCash','EasyPaisa'].includes(o.paymentMethod)).length
  const outOfStock      = products.filter(p => p.stock === 0).length
  const lowStock        = products.filter(p => p.stock > 0 && p.stock <= 5).length

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

  const statusColor = (s) => {
    if (s === 'Delivered') return '#34d399'
    if (s === 'Cancelled') return '#f87171'
    if (s === 'Shipped')   return '#60a5fa'
    if (s === 'Processing') return '#fb923c'
    if (s === 'Confirmed') return '#a78bfa'
    return '#9ca3af'
  }

  return (
    <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', paddingBottom: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        <AdminNav />

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            RizerSpace store overview — live data
          </p>
        </div>

        {loadingOrders || loadingProducts ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.3)' }}>
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* ── KPI Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon={TrendingUp}   label="Total Revenue (Paid)"    value={`$${totalRevenue.toFixed(2)}`}  color="#34d399" delay={0} />
              <StatCard icon={ShoppingBag}  label="Total Orders"            value={orders.length}                   color="#e50914" delay={0.05} />
              <StatCard icon={Package}      label="Total Products"          value={products.length}                 color="#60a5fa" delay={0.1} />
              <StatCard icon={CreditCard}   label="Pending Wallet Payments" value={pendingPayments}                 color="#fbbf24" sub={pendingPayments > 0 ? '⚠ Action needed' : undefined} delay={0.15} />
            </div>

            {/* ── Order Status Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Pending',   value: pendingOrders,   icon: Clock,         color: '#9ca3af' },
                { label: 'Confirmed', value: confirmedOrders, icon: CheckCircle,    color: '#a78bfa' },
                { label: 'Shipped',   value: shippedOrders,   icon: Truck,         color: '#60a5fa' },
                { label: 'Delivered', value: deliveredOrders, icon: CheckCircle,   color: '#34d399' },
                { label: 'Cancelled', value: cancelledOrders, icon: XCircle,       color: '#f87171' },
              ].map((s, i) => (
                <StatCard key={s.label} icon={s.icon} label={`${s.label} Orders`} value={s.value} color={s.color} delay={i * 0.05} />
              ))}
            </div>

            {/* ── Inventory Alerts ── */}
            {(outOfStock > 0 || lowStock > 0) && (
              <div style={{
                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 14, padding: '14px 20px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, margin: 0 }}>Inventory Alert</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '2px 0 0' }}>
                    {outOfStock > 0 && `${outOfStock} product(s) out of stock. `}
                    {lowStock > 0 && `${lowStock} product(s) have 5 or fewer units.`}
                  </p>
                </div>
                <Link to="/admin/products" style={{
                  padding: '8px 16px', borderRadius: 8, background: '#fbbf24', color: '#000',
                  fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6
                }}>
                  Manage Stock <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* ── Recent Orders ── */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>Recent Orders</h2>
                <Link to="/admin/orders" style={{ fontSize: 12, color: '#e50914', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <ArrowRight size={13} />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                  No orders yet
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o, i) => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 16px', color: '#e50914', fontFamily: 'monospace', fontWeight: 700 }}>{o.orderId}</td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.8)' }}>{o.contactName}</td>
                          <td style={{ padding: '12px 16px', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>${o.totalAmount?.toFixed(2)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                              background: o.paymentStatus === 'Paid' ? '#064e3b' : '#7c2d12',
                              color: o.paymentStatus === 'Paid' ? '#34d399' : '#fb923c'
                            }}>{o.paymentStatus}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: statusColor(o.orderStatus), fontWeight: 700 }}>{o.orderStatus}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
