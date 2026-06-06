import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Truck, CheckCircle, Clock, XCircle, Copy, ArrowLeft, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { key: 'Pending',    label: 'Order Placed',  icon: Clock },
  { key: 'Confirmed',  label: 'Confirmed',     icon: CheckCircle },
  { key: 'Processing', label: 'Processing',    icon: Package },
  { key: 'Shipped',    label: 'Shipped',       icon: Truck },
  { key: 'Delivered',  label: 'Delivered',     icon: CheckCircle },
]

const CANCELLED_STEP = { key: 'Cancelled', label: 'Cancelled', icon: XCircle }

const paymentColor = (status) => {
  if (status === 'Paid')    return { color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }
  if (status === 'Failed')  return { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }
  return { color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }
}

export default function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  const isStripeSuccess = searchParams.get('stripe_success') === '1'
  const stripeSessionId = searchParams.get('session_id')
  
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Verify Stripe payment on redirect back from hosted checkout
  const verifyMut = useMutation({
    mutationFn: () => api.post('/orders/verify-stripe', { orderId: id, sessionId: stripeSessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id])
      toast.success('Payment confirmed! Your order is placed.')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Payment verification failed. Contact support.')
  })

  // Cancel order mutation
  const cancelMut = useMutation({
    mutationFn: () => api.put(`/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id])
      toast.success('Order cancelled')
      setShowCancelModal(false)
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to cancel order')
  })

  // Fetch payment info (wallet numbers)
  const { data: paymentInfo } = useQuery({
    queryKey: ['payment-info'],
    queryFn: () => api.get('/orders/payment-info').then(r => r.data.data),
    staleTime: 60000
  })

  useEffect(() => {
    if (isStripeSuccess && stripeSessionId) {
      verifyMut.mutate()
    }
  }, [isStripeSuccess, stripeSessionId])

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
    refetchInterval: isStripeSuccess ? 3000 : false,
  })

  const order = data

  if (isLoading) {
    return (
      <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'rgba(255,255,255,0.4)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#e50914' }} />
          <p style={{ fontSize: 14 }}>Loading order...</p>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>Order not found.</p>
          <Link to="/orders" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 600 }}>← Back to Orders</Link>
        </div>
      </main>
    )
  }

  const isCancelled = order.orderStatus === 'Cancelled'
  const steps = isCancelled ? [...STEPS, CANCELLED_STEP] : STEPS
  const currentIdx = steps.findIndex(s => s.key === order.orderStatus)
  const pmColor = paymentColor(order.paymentStatus)

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const displayWalletNumber = order.paymentMethod === 'EasyPaisa'
    ? (paymentInfo?.easyPaisaNumber || '+92 345 1470780')
    : (paymentInfo?.jazzCashNumber || '+92 345 1470780')

  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus)

  return (
    <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Back */}
        <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={15} /> Back to Orders
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>Order Tracking</h1>
            <p style={{ color: '#e50914', fontFamily: 'monospace', fontSize: 13, margin: 0, fontWeight: 700 }}>{order.orderId}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, ...pmColor }}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: 20, left: '5%', right: '5%', height: 2, background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
            <div style={{
              position: 'absolute', top: 20, left: '5%', height: 2,
              width: currentIdx < 0 ? '0%' : `${(currentIdx / (steps.length - 1)) * 90}%`,
              background: isCancelled ? '#ef4444' : '#e50914', zIndex: 1,
              transition: 'width 0.5s ease'
            }} />

            {steps.map((step, i) => {
              const Icon = step.icon
              const done = i < currentIdx
              const active = i === currentIdx
              const colour = isCancelled && step.key === 'Cancelled' ? '#ef4444' : active || done ? '#e50914' : 'rgba(255,255,255,0.2)'
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active || done ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${colour}`,
                    transition: 'all 0.3s'
                  }}>
                    <Icon size={16} color={colour} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#fff' : done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: 0.5 }}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions Section */}
        {canCancel && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setShowCancelModal(true)} style={{
              padding: '10px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            >
              Cancel Order
            </button>
          </div>
        )}

        {/* Payment Reference / Wallet Instructions */}
        {order.paymentReference && order.paymentStatus === 'Pending' && ['JazzCash', 'EasyPaisa'].includes(order.paymentMethod) && (
          <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>⏳ Awaiting {order.paymentMethod} Payment</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Send To</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{displayWalletNumber}</span>
                  <button onClick={() => copy(displayWalletNumber)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}><Copy size={13} /></button>
                </div>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Payment Reference</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800, fontSize: 16 }}>{order.paymentReference}</span>
                  <button onClick={() => copy(order.paymentReference)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}><Copy size={13} /></button>
                </div>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Amount Due</p>
                <span style={{ color: '#e50914', fontFamily: 'monospace', fontWeight: 900, fontSize: 18 }}>${order.totalAmount?.toFixed(2)}</span>
              </div>
              {order.transactionId && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Your TXN ID</p>
                  <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: 12 }}>{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="order-detail-grid" style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
          {/* Shipping */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={13} color="#e50914" /> Shipping To
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 4px', fontWeight: 600 }}>{order.contactName}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 4px' }}>{order.contactPhone}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>{order.shippingAddress}</p>
          </div>

          {/* Payment Summary */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Payment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Method</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              {order.couponCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Coupon</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{order.couponCode} (−${order.discountAmount?.toFixed(2)})</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Total</span>
                <span style={{ color: '#e50914', fontWeight: 900, fontFamily: 'monospace', fontSize: 15 }}>${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{item.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 28, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <XCircle size={28} color="#ef4444" />
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>Cancel Order?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 }}>
                Are you sure you want to cancel order <strong>#{order.orderId}</strong>? This action cannot be undone and your items will be returned to stock.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowCancelModal(false)} style={{
                  flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}>
                  No, Keep Order
                </button>
                <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending} style={{
                  flex: 1, padding: 12, borderRadius: 10, background: '#ef4444',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: cancelMut.isPending ? 'not-allowed' : 'pointer'
                }}>
                  {cancelMut.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
