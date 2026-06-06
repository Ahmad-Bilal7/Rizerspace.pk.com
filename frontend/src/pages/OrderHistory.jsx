import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, ArrowRight, XCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Pending:    'text-red-400 bg-red-400/10 border-red-400/30',
  Confirmed:  'text-red-500 bg-red-500/10 border-red-500/30',
  Processing: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Shipped:    'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Delivered:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Cancelled:  'text-gray-500 bg-gray-500/10 border-gray-500/30',
}

export default function OrderHistory() {
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['myorders'],
    queryFn: () => api.get('/orders/myorders').then(r => r.data.data),
  })

  // Cancel order mutation
  const cancelMut = useMutation({
    mutationFn: (id) => api.put(`/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries(['myorders'])
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      setSelectedOrderId(null)
    },
    onError: (e) => {
      toast.error(e.response?.data?.error || 'Failed to cancel order')
    }
  })

  if (isLoading) return (
    <main className="pt-24 px-4 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-neon-red animate-spin" />
    </main>
  )

  if (!data?.length) return (
    <main className="pt-24 px-4 min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-7xl opacity-20">📦</div>
      <h2 className="font-syne font-black text-3xl text-white/50">No orders yet</h2>
      <p className="text-white/30">Your order history will appear here</p>
      <Link to="/catalog" className="btn-primary flex items-center gap-2">Shop Now <ArrowRight size={16} /></Link>
    </main>
  )

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-syne font-black text-4xl text-white mb-10">
          Order <span className="gradient-text">History</span>
        </h1>
        <div className="flex flex-col gap-4">
          {data.map((order, i) => (
            <motion.div key={order._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              className="glass rounded-2xl p-5 border border-white/8 hover:border-neon-red/30 transition-all">
              
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-white/30 font-mono mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || 'text-white/50'}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-syne font-black text-lg gradient-text">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {order.items?.slice(0,3).map((item, j) => (
                  <div key={j} className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/5">
                    <Package size={12} className="text-neon-red/60" />
                    <span className="text-xs text-white/60 max-w-[120px] truncate">{item.product?.title || 'Figure'}</span>
                    <span className="text-xs text-white/30">×{item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="flex items-center glass rounded-xl px-3 py-2 border border-white/5">
                    <span className="text-xs text-white/30">+{order.items.length - 3} more</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-white/30 pt-3 border-t border-white/5">
                <span>via {order.paymentMethod} · {order.paymentStatus}</span>
                <div className="flex items-center gap-4">
                  {['Pending', 'Confirmed'].includes(order.orderStatus) && (
                    <button onClick={() => { setSelectedOrderId(order._id); setShowCancelModal(true); }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}
                      className="hover:underline">
                      Cancel Order
                    </button>
                  )}
                  <Link to={`/orders/${order._id}`} className="flex items-center gap-1 text-neon-red hover:text-danger transition-colors font-semibold">
                    Track Order <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

            </motion.div>
          ))}
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
                Are you sure you want to cancel this order? This action cannot be undone and your items will be returned to stock.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setShowCancelModal(false); setSelectedOrderId(null); }} style={{
                  flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}>
                  No, Keep Order
                </button>
                <button onClick={() => cancelMut.mutate(selectedOrderId)} disabled={cancelMut.isPending} style={{
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
