import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, X, Loader2, Truck, CheckCircle, CreditCard, XCircle, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import AdminNav from '../../components/AdminNav'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const paymentBadge = (status) => {
  const styles = {
    Paid:    { background: '#064e3b', color: '#34d399', border: '1px solid #065f46' },
    Pending: { background: '#7c2d12', color: '#fb923c', border: '1px solid #9a3412' },
    Failed:  { background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' },
  }
  return styles[status] || styles.Pending
}

const orderStatusBadge = (status) => {
  if (status === 'Delivered') return { background: '#064e3b', color: '#34d399' }
  if (status === 'Cancelled') return { background: '#450a0a', color: '#f87171' }
  if (status === 'Shipped')   return { background: '#1e3a5f', color: '#60a5fa' }
  if (status === 'Processing') return { background: '#7c2d12', color: '#fb923c' }
  return { background: '#1c1917', color: '#e5e7eb' }
}

const actionBtnStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6
}

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPayment, setFilterPayment] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders').then(r => r.data.data)
  })

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-orders'])
      if (selectedOrder?._id === res.data.data._id) setSelectedOrder(res.data.data)
      toast.success('Order status updated')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update status')
  })

  const verifyPaymentMut = useMutation({
    mutationFn: (id) => api.put(`/orders/${id}/verify-payment`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-orders'])
      if (selectedOrder?._id === res.data.data._id) setSelectedOrder(res.data.data)
      toast.success('Payment verified — order confirmed!')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Verification failed')
  })

  const orders = data || []
  
  // Apply dual filters (Order Status + Payment Status)
  const filtered = orders.filter(o => {
    const statusMatch = filterStatus === 'All' || o.orderStatus === filterStatus
    const paymentMatch = filterPayment === 'All' || o.paymentStatus === filterPayment
    return statusMatch && paymentMatch
  })

  return (
    <main style={{ paddingTop: 80, paddingBottom: 60, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>Orders</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Manage customer orders, verify payments, update shipping status
          </p>
        </div>

        <AdminNav />

        {/* Filters Group */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Status Filters */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Order Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['All', ...STATUS_OPTIONS].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: filterStatus === s ? '#e50914' : 'rgba(255,255,255,0.03)',
                  color: filterStatus === s ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: filterStatus === s ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.15s'
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Payment Status Filters */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Payment Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['All', 'Pending', 'Paid'].map(p => (
                <button key={p} onClick={() => setFilterPayment(p)} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: filterPayment === p ? '#e50914' : 'rgba(255,255,255,0.03)',
                  color: filterPayment === p ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: filterPayment === p ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.15s'
                }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'rgba(255,255,255,0.4)' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Loading orders...</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Order ID', 'Customer Details', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const isWalletPending = ['JazzCash', 'EasyPaisa'].includes(o.paymentMethod) && o.paymentStatus === 'Pending'
                    return (
                      <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 11, color: '#e50914', fontWeight: 700 }}>
                          {o.orderId}
                        </td>
                        {/* Comprehensive Customer details */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{o.contactName}</div>
                          <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2, fontWeight: 600 }}>{o.contactPhone}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{o.contactEmail}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.shippingAddress}>
                            {o.shippingAddress}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.7)' }}>
                          {o.items?.reduce((sum, i) => sum + i.quantity, 0)} pcs
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>
                          ${o.totalAmount?.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{o.paymentMethod}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, ...paymentBadge(o.paymentStatus) }}>
                            {o.paymentStatus?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...orderStatusBadge(o.orderStatus) }}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select
                              value={o.orderStatus}
                              onChange={e => updateStatusMut.mutate({ id: o._id, status: e.target.value })}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#fff', cursor: 'pointer' }}
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {isWalletPending && (
                              <button
                                onClick={() => verifyPaymentMut.mutate(o._id)}
                                disabled={verifyPaymentMut.isPending}
                                title="Verify Manual Payment"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: '#064e3b', border: '1px solid #065f46', color: '#34d399', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >
                                <CheckCircle size={12} /> Verify
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(o)}
                              title="View Details"
                              style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex' }}
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Order Details</h2>
                  <p style={{ color: '#e50914', fontSize: 11, fontFamily: 'monospace', margin: '4px 0 0' }}>{selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ padding: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Customer + Address */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 10px' }}>Customer Profile</h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 4px', fontWeight: 600 }}>{selectedOrder.contactName}</p>
                  <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 4px', fontWeight: 600 }}>Phone: {selectedOrder.contactPhone}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 8px' }}>Email: {selectedOrder.contactEmail}</p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Shipping Address</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Quick Fulfillment Actions */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 12px' }}>Fulfillment Quick Actions</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedOrder.orderStatus === 'Pending' && (
                      <button onClick={() => updateStatusMut.mutate({ id: selectedOrder._id, status: 'Confirmed' })} style={{ ...actionBtnStyle, background: '#d97706' }}>
                        Confirm Order
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Confirmed' && (
                      <button onClick={() => updateStatusMut.mutate({ id: selectedOrder._id, status: 'Processing' })} style={{ ...actionBtnStyle, background: '#2563eb' }}>
                        Mark Processing
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Processing' && (
                      <button onClick={() => updateStatusMut.mutate({ id: selectedOrder._id, status: 'Shipped' })} style={{ ...actionBtnStyle, background: '#6366f1' }}>
                        Mark Shipped
                      </button>
                    )}
                    {selectedOrder.orderStatus === 'Shipped' && (
                      <button onClick={() => updateStatusMut.mutate({ id: selectedOrder._id, status: 'Delivered' })} style={{ ...actionBtnStyle, background: '#059669' }}>
                        Mark Delivered
                      </button>
                    )}
                    {['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(selectedOrder.orderStatus) && (
                      <button onClick={() => updateStatusMut.mutate({ id: selectedOrder._id, status: 'Cancelled' })} style={{ ...actionBtnStyle, background: '#dc2626' }}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={13} /> Payment Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Method</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status</span>
                      <span style={{ fontWeight: 700, padding: '1px 6px', borderRadius: 4, ...paymentBadge(selectedOrder.paymentStatus) }}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.paymentReference && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Payment Ref</span>
                        <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 11 }}>{selectedOrder.paymentReference}</span>
                      </div>
                    )}
                    {selectedOrder.transactionId && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Customer TXN ID</span>
                        <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: 11 }}>{selectedOrder.transactionId}</span>
                      </div>
                    )}
                    {['JazzCash', 'EasyPaisa'].includes(selectedOrder.paymentMethod) && selectedOrder.paymentStatus === 'Pending' && (
                      <button
                        onClick={() => { verifyPaymentMut.mutate(selectedOrder._id); setSelectedOrder(null) }}
                        style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, background: '#065f46', border: '1px solid #047857', color: '#34d399', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <CheckCircle size={14} /> Mark Payment as Verified
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: '0 0 10px' }}>Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.image && <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                          <div>
                            <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0 }}>{item.name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(229,9,20,0.07)', borderRadius: 10, border: '1px solid rgba(229,9,20,0.2)' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Order Total</span>
                  <span style={{ color: '#e50914', fontWeight: 900, fontFamily: 'monospace', fontSize: 16 }}>${selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>

                {/* Status Dropdown Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Manual Status Override:</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={e => updateStatusMut.mutate({ id: selectedOrder._id, status: e.target.value })}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }}
                  >Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
