import { motion } from 'framer-motion'
import { RotateCcw, CheckCircle, XCircle, Clock, Mail, ArrowRight, AlertTriangle } from 'lucide-react'
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

export default function Returns() {
  return (
    <main className="pt-16 min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20 mx-auto mb-6">
            <RotateCcw size={28} className="text-red-500" />
          </div>
          <h1 className="font-syne font-black text-5xl text-white mb-4">
            Returns & <span className="text-red-500">Refunds</span>
          </h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-lg mx-auto">
            Your satisfaction is guaranteed. If something is wrong with your order, we will make it right.
          </p>
          <p className="text-white/30 text-xs mt-3">Last updated: June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Quick answer banner */}
          <motion.div {...fade(0.05)} style={{
            background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 14, padding: '18px 24px', marginBottom: 24, textAlign: 'center'
          }}>
            <p style={{ color: '#34d399', fontWeight: 900, fontSize: 18, margin: '0 0 6px' }}>30-Day Return Window</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>
              Return any eligible item within 30 days of delivery for a full refund or exchange.
            </p>
          </motion.div>

          <Section title="What Can Be Returned" icon={CheckCircle} delay={0.1}>
            <div className="flex flex-col gap-3">
              {[
                'Items in original, factory-sealed, unopened packaging',
                'Figures that arrived defective (broken parts, missing accessories, wrong item)',
                'Figures that arrived with visible shipping damage (crushed box, cracked paint)',
                'Wrong item received (different character, scale, or brand than ordered)',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle size={15} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="What Cannot Be Returned" icon={XCircle} delay={0.15}>
            <div className="flex flex-col gap-3">
              {[
                'Figures that have been opened, assembled, or displayed',
                'Items returned more than 30 days after delivery',
                'Items without original packaging or that are missing accessories',
                'Damage caused by the customer after delivery (drops, scratches, improper storage)',
                'Limited edition or pre-order items (unless defective)',
                'Items purchased during final-sale or clearance promotions (marked "No Returns")',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <XCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="How to Start a Return" icon={RotateCcw} delay={0.2}>
            <div className="flex flex-col gap-4">
              {[
                { step: '1', title: 'Contact us within 30 days', desc: 'Email rizerspace50@gmail.com with your order number, the reason for return, and clear photos of the item and packaging.' },
                { step: '2', title: 'Receive return approval', desc: 'Our team reviews your request within 24 hours and emails you a return authorisation with shipping instructions.' },
                { step: '3', title: 'Ship the item back', desc: 'Pack the item securely in its original packaging and ship it to the address provided. Return shipping is at your cost unless the return is due to our error.' },
                { step: '4', title: 'Inspection & refund', desc: 'Once we receive and inspect the item (1–2 business days), we process your refund or dispatch the replacement.' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e50914', color: '#fff', fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 4px' }}>{title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Refund Timelines" icon={Clock} delay={0.25}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'JazzCash / EasyPaisa', value: '2–3 Business Days', note: 'Sent to original mobile number' },
                { label: 'Credit / Debit Card (Stripe)', value: '5–10 Business Days', note: 'Depends on issuing bank' },
                { label: 'Cash on Delivery (Refund)', value: '3–5 Business Days', note: 'Bank transfer to your account' },
              ].map(({ label, value, note }) => (
                <div key={label} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>{value}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '2px 0 0' }}>{note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
              Refund timelines begin after inspection is complete. We will notify you by email when the refund has been initiated.
            </p>
          </Section>

          <Section title="Damaged or Defective Items" icon={AlertTriangle} delay={0.3}>
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
              <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, margin: '0 0 6px' }}>⚡ Priority Handling</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Damaged or defective item reports are treated as highest priority. We aim to resolve these within 24 hours of you contacting us.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                'Contact us within 48 hours of delivery — do not discard packaging',
                'Send clear photos/video of the damage (figure, packaging, outer box)',
                'We will ship a replacement at zero cost, or issue a full refund — your choice',
                'You do not need to return the damaged item in most cases',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0, marginTop: 3 }} />
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto text-center">
          <Mail size={32} className="text-red-500 mx-auto mb-4 opacity-70" />
          <h2 className="font-syne font-black text-2xl text-white mb-3">Need Help With a Return?</h2>
          <p className="text-white/40 text-sm mb-8">Email us with your order number and photos and we will take care of the rest.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:rizerspace50@gmail.com" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Email rizerspace50@gmail.com <ArrowRight size={15} />
            </a>
            <Link to="/faq#returns" className="btn-secondary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Return FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
