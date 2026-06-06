import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ShoppingBag, Truck, CreditCard, Smartphone, Banknote, ChevronRight, Loader2, Copy, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { clearCart } from '../store/cartSlice'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', outline: 'none', boxSizing: 'border-box'
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)

  const [form, setForm] = useState({
    contactName:     user?.name || '',
    contactEmail:    user?.email || '',
    contactPhone:    '',
    shippingAddress: '',
    paymentMethod:   'COD',
    transactionId:   '',
    couponCode:      '',
  })
  const [paymentRef, setPaymentRef] = useState(null)
  const [step, setStep] = useState('form') // 'form' | 'wallet-instructions'

  // Query payment configurations (EasyPaisa/JazzCash numbers)
  const { data: paymentInfo } = useQuery({
    queryKey: ['payment-info'],
    queryFn: () => api.get('/orders/payment-info').then(r => r.data.data),
    staleTime: 60000 // Cache for 1 minute
  })

  const easyPaisaNo = paymentInfo?.easyPaisaNumber || '+92 345 1470780'
  const jazzCashNo = paymentInfo?.jazzCashNumber || '+92 345 1470780'

  const PAYMENT_METHODS = [
    { id: 'COD',       label: 'Cash on Delivery',    icon: Banknote,    desc: 'Pay when your order arrives' },
    { id: 'JazzCash',  label: 'JazzCash',             icon: Smartphone,  desc: 'Send to: ' + jazzCashNo },
    { id: 'EasyPaisa', label: 'EasyPaisa',            icon: Smartphone,  desc: 'Send to: ' + easyPaisaNo },
    { id: 'Stripe',    label: 'Credit / Debit Card',  icon: CreditCard,  desc: 'Secure card checkout via Stripe' },
  ]

  const subtotal = items.reduce((s, i) => s + (i.discountedPrice || i.price) * i.quantity, 0)
  const total = subtotal

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── COD / Wallet order mutation ──────────────────────────────────────────
  const placeMut = useMutation({
    mutationFn: (body) => api.post('/orders', body),
    onSuccess: (res) => {
      const order = res.data.data
      dispatch(clearCart())
      if (['JazzCash', 'EasyPaisa'].includes(form.paymentMethod)) {
        setPaymentRef(order.paymentReference)
        setStep('wallet-instructions')
      } else {
        toast.success('Order placed! Cash on Delivery confirmed.')
        navigate(`/orders/${order._id}`)
      }
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to place order')
  })

  // ── Stripe session mutation ─────────────────────────────────────────────
  const stripeMut = useMutation({
    mutationFn: (body) => api.post('/orders/stripe-session', body),
    onSuccess: (res) => {
      dispatch(clearCart())
      window.location.href = res.data.checkoutUrl
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Stripe session failed')
  })

  const buildPayload = () => ({
    items: items.map(i => ({ product: i._id, quantity: i.quantity })),
    contactName:     form.contactName,
    contactEmail:    form.contactEmail,
    contactPhone:    form.contactPhone,
    shippingAddress: form.shippingAddress,
    paymentMethod:   form.paymentMethod,
    transactionId:   form.transactionId || undefined,
    couponCode:      form.couponCode || undefined,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.contactName || !form.contactEmail || !form.contactPhone || !form.shippingAddress) {
      return toast.error('Please fill in all contact and address fields')
    }
    if (items.length === 0) return toast.error('Your cart is empty')

    if (form.paymentMethod === 'Stripe') {
      stripeMut.mutate(buildPayload())
    } else {
      placeMut.mutate(buildPayload())
    }
  }

  const isBusy = placeMut.isPending || stripeMut.isPending

  // ── Wallet instructions screen ───────────────────────────────────────────
  if (step === 'wallet-instructions') {
    const displayWalletNumber = form.paymentMethod === 'EasyPaisa' ? easyPaisaNo : jazzCashNo

    return (
      <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px' }}>
        <div style={{ maxWidth: 480, width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#064e3b', border: '2px solid #047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={28} color="#34d399" />
          </div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Order Placed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px' }}>
            Now complete your {form.paymentMethod} payment to confirm your order.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'left' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Send Payment To</p>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 16px', fontFamily: 'monospace' }}>{displayWalletNumber}</p>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Amount</p>
            <p style={{ color: '#e50914', fontSize: 22, fontWeight: 900, margin: '0 0 16px', fontFamily: 'monospace' }}>${total.toFixed(2)}</p>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Your Payment Reference</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800, fontSize: 18 }}>{paymentRef}</span>
              <button onClick={() => { navigator.clipboard.writeText(paymentRef); toast.success('Copied!') }}
                style={{ padding: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <Copy size={15} />
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: '#fbbf24', fontSize: 12, margin: 0, fontWeight: 600 }}>
              ⚠️ Use <strong>{paymentRef}</strong> as the message/note when sending payment. Our team will verify your transaction within 2–4 hours.
            </p>
          </div>

          <button onClick={() => navigate('/orders')}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#e50914', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
            View My Orders
          </button>
        </div>
      </main>
    )
  }

  // ── Main checkout form ───────────────────────────────────────────────────
  return (
    <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 28px' }}>Checkout</h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 28, alignItems: 'start' }} className="checkout-grid">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Contact Info */}
            <section style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} color="#e50914" /> Contact & Delivery
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Ahmad Bilal" required />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input style={inputStyle} value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+92 300 1234567" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="you@example.com" required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Shipping Address * <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(Full address including city, province, country)</span></label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    value={form.shippingAddress}
                    onChange={e => set('shippingAddress', e.target.value)}
                    placeholder="House 5, Street 3, F-7/2, Islamabad, Punjab, Pakistan"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={16} color="#e50914" /> Payment Method
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map(pm => {
                  const Icon = pm.icon
                  const selected = form.paymentMethod === pm.id
                  return (
                    <label key={pm.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                      background: selected ? 'rgba(229,9,20,0.08)' : 'rgba(255,255,255,0.03)',
                      border: selected ? '1px solid rgba(229,9,20,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.15s'
                    }}>
                      <input type="radio" name="paymentMethod" value={pm.id} checked={selected} onChange={() => set('paymentMethod', pm.id)} style={{ display: 'none' }} />
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: selected ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={17} color={selected ? '#e50914' : 'rgba(255,255,255,0.5)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, margin: 0 }}>{pm.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{pm.desc}</p>
                      </div>
                      {selected && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e50914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                      </div>}
                    </label>
                  )
                })}
              </div>

              {/* Wallet TXN ID input */}
              {['JazzCash', 'EasyPaisa'].includes(form.paymentMethod) && (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(251,191,36,0.06)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p style={{ color: '#fbbf24', fontSize: 12, fontWeight: 600, margin: '0 0 10px' }}>
                    📱 After placing the order, send <strong>${total.toFixed(2)}</strong> to <strong>{form.paymentMethod === 'EasyPaisa' ? easyPaisaNo : jazzCashNo}</strong>. A payment reference will be shown to you.
                  </p>
                  <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.5)' }}>Already transferred? Enter your TXN ID (optional)</label>
                  <input style={inputStyle} value={form.transactionId} onChange={e => set('transactionId', e.target.value)} placeholder="e.g. TXN1234567890" />
                </div>
              )}

              {form.paymentMethod === 'Stripe' && (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ color: '#6ee7b7', fontSize: 12, margin: 0 }}>
                    🔒 You will be redirected to Stripe's secure checkout. Pay with credit or debit card — your order is confirmed once payment is complete.
                  </p>
                </div>
              )}

              {/* Coupon */}
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Coupon Code (optional)</label>
                <input style={inputStyle} value={form.couponCode} onChange={e => set('couponCode', e.target.value.toUpperCase())} placeholder="SAVE10" />
              </div>
            </section>
          </div>

          {/* Right column — Order Summary */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={16} color="#e50914" /> Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=80'} alt={item.title}
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: '#1a1a1a', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <span>Shipping</span><span>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 12 }}>
                  <span>Total</span>
                  <span style={{ color: '#e50914', fontFamily: 'monospace' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={isBusy || items.length === 0}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer',
                  background: isBusy ? 'rgba(229,9,20,0.5)' : '#e50914', color: '#fff', fontWeight: 800, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s'
                }}>
                {isBusy ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ChevronRight size={18} />}
                {isBusy ? 'Processing...' : form.paymentMethod === 'Stripe' ? 'Pay with Stripe' : 'Place Order'}
              </button>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 12 }}>
                🔒 Your data is encrypted and secure
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
