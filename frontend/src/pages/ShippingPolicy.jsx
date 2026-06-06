import { motion } from 'framer-motion'
import { Truck, Clock, Package, MapPin, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay }
})

const Section = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div {...fade(delay)}
    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
    <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="#e50914" />
      </div>
      {title}
    </h2>
    {children}
  </motion.div>
)

const Row = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{label}</span>
    <span style={{ color: highlight ? '#34d399' : '#fff', fontWeight: 700, fontSize: 13 }}>{value}</span>
  </div>
)

export default function ShippingPolicy() {
  return (
    <main className="pt-16 min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20 mx-auto mb-6">
            <Truck size={28} className="text-red-500" />
          </div>
          <h1 className="font-syne font-black text-5xl text-white mb-4">
            Shipping <span className="text-red-500">Policy</span>
          </h1>
          <p className="text-white/45 text-sm leading-relaxed">
            We take your collection seriously. Every figure is packed with care and shipped to your door safely.
          </p>
          <p className="text-white/30 text-xs mt-3">Last updated: June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          <Section title="Delivery Timeframes" icon={Clock} delay={0.1}>
            <Row label="Major Cities (Karachi, Lahore, Islamabad, Rawalpindi)" value="2–4 Business Days" />
            <Row label="Other Cities & Towns" value="4–7 Business Days" />
            <Row label="Remote / Rural Areas" value="7–12 Business Days" />
            <Row label="Order Cut-off Time" value="2:00 PM PKT (Mon–Sat)" />
            <Row label="Processing Time (after payment confirmed)" value="1 Business Day" />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 14, lineHeight: 1.6, margin: '14px 0 0' }}>
              ⓘ Business days exclude Sundays and public holidays. Delivery times are estimates and may vary during peak periods (Eid, 11.11 sales, etc.).
            </p>
          </Section>

          <Section title="Shipping Rates" icon={Package} delay={0.15}>
            <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ color: '#34d399', fontWeight: 900, fontSize: 20, margin: 0 }}>🎉 Free Shipping on All Orders</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6, marginBottom: 0 }}>No minimum order value. Free delivery anywhere in Pakistan.</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              We believe you should not pay extra to receive your collectibles. Shipping costs are fully covered by RizerSpace for all domestic orders regardless of size or weight.
            </p>
          </Section>

          <Section title="Packaging Standards" icon={Package} delay={0.2}>
            <div className="flex flex-col gap-3">
              {[
                { icon: '📦', text: 'Double-box packaging — the figure box is placed inside a plain outer shipping box with foam inserts.' },
                { icon: '🛡️', text: 'Foam and bubble wrap padding on all sides to prevent movement and absorb shock.' },
                { icon: '🔒', text: 'Tamper-evident sealing with strong packing tape and a security sticker.' },
                { icon: '🏷️', text: 'Clear address label with order reference — discreet packaging, no brand name on the outer box.' },
                { icon: '📸', text: 'All orders are photographed before sealing as a shipping record.' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Delivery Areas" icon={MapPin} delay={0.25}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              We currently deliver across all provinces of Pakistan including:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'FATA', 'Islamabad (ICT)'].map(area => (
                <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CheckCircle size={12} color="#34d399" />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>{area}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Order Tracking" icon={Truck} delay={0.3}>
            <div className="flex flex-col gap-3">
              {[
                { step: '1', label: 'Order Placed', desc: 'You receive an order confirmation notification in your account.' },
                { step: '2', label: 'Payment Confirmed', desc: 'Payment is verified (auto for COD/Stripe, manual for JazzCash/EasyPaisa within 2–4 hrs).' },
                { step: '3', label: 'Processing', desc: 'Your figure is picked, quality-checked, and packed.' },
                { step: '4', label: 'Shipped', desc: 'Order handed to courier. Tracking status updates in real-time in your account.' },
                { step: '5', label: 'Delivered', desc: 'Delivered to your door. Payment marked Paid for COD orders.' },
              ].map(({ step, label, desc }) => (
                <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e50914', color: '#fff', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 3px' }}>{label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Important Notes" icon={AlertTriangle} delay={0.35}>
            <div className="flex flex-col gap-3">
              {[
                'Ensure your shipping address and phone number are accurate at checkout — incorrect addresses may cause failed deliveries.',
                'Someone must be available to receive the order. Our courier may attempt delivery up to 3 times before returning the package.',
                'For Cash on Delivery orders, please have the exact amount ready at the time of delivery.',
                'RizerSpace is not responsible for delays caused by natural disasters, strikes, or courier disruptions beyond our control.',
                'If your order shows "Delivered" but you did not receive it, contact us within 24 hours.',
              ].map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{note}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/40 text-sm mb-6">Questions about your shipment? We're here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:rizerspace50@gmail.com" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Contact Support <ArrowRight size={15} />
            </a>
            <Link to="/faq" className="btn-secondary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Read FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
