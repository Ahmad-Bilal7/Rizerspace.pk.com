import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        q: 'How long does shipping take?',
        a: 'Standard delivery takes 3–7 business days within Pakistan. Orders to major cities (Karachi, Lahore, Islamabad) typically arrive in 2–4 days. Remote areas may take up to 10 business days.'
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently we ship within Pakistan only. International shipping is on our roadmap for 2025. Sign up for our newsletter to be notified when it launches.'
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is shipped, you will receive a notification. You can track your order status in real-time by going to My Orders → Track Order in your account.'
      },
      {
        q: 'Can I cancel my order?',
        a: 'Yes! You can cancel any order that is in "Pending" or "Confirmed" status. Go to My Orders, find the order, and click "Cancel Order". Once an order is Shipped, it cannot be cancelled.'
      },
      {
        q: 'Is there free shipping?',
        a: 'Yes — we offer free shipping on all orders. No minimum order value required.'
      },
    ]
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Cash on Delivery (COD), JazzCash, EasyPaisa, and Credit/Debit Card via Stripe (Visa, Mastercard, Amex).'
      },
      {
        q: 'How do JazzCash and EasyPaisa payments work?',
        a: 'After placing your order, you will receive a unique payment reference code (e.g. RZ-PAY-1234). Send the exact amount to +92 345 1470780 using that reference as the note. Our team verifies within 2–4 hours and confirms your order.'
      },
      {
        q: 'Is my card information secure?',
        a: 'Absolutely. Card payments are processed by Stripe — a PCI-DSS Level 1 certified payment processor used by millions of businesses worldwide. We never store your card details.'
      },
      {
        q: 'Can I use a coupon code?',
        a: 'Yes! Enter your coupon code at checkout in the "Coupon Code" field. Discounts are applied automatically. Follow us on social media for exclusive coupon drops.'
      },
      {
        q: 'When will my COD payment be marked as paid?',
        a: 'For Cash on Delivery orders, payment status is automatically updated to "Paid" when our team marks the order as "Delivered".'
      },
    ]
  },
  {
    category: 'Products & Authenticity',
    items: [
      {
        q: 'Are all figures authentic and officially licensed?',
        a: 'Yes — 100%. We source exclusively from authorised distributors. Every figure comes with original packaging, holographic authenticity seals (where applicable), and official brand markings. We do not sell bootlegs, knock-offs, or grey-market products.'
      },
      {
        q: 'What scale are the figures?',
        a: 'We stock a range of scales from 1/12 (Nendoroids) up to 1/4 (premium statues). Each product page clearly lists the scale, dimensions, and weight. Use the category filter on the catalog to browse by type.'
      },
      {
        q: 'What if a product is out of stock?',
        a: 'Subscribe to our newsletter to get restock notifications first. You can also contact us directly at rizerspace50@gmail.com to request a specific figure and we will source it for you.'
      },
      {
        q: 'Can I request a figure that is not in the catalog?',
        a: 'Yes! Email us at rizerspace50@gmail.com with the product name, brand, and scale. We review all requests and add frequently requested figures to our sourcing list.'
      },
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 30 days of delivery for items in their original, unopened packaging. Figures that have been opened are not eligible for return unless they arrived damaged or defective.'
      },
      {
        q: 'What if my figure arrived damaged?',
        a: 'Contact us within 48 hours of delivery with photos of the damage. We will arrange a replacement or full refund at no cost to you. All our figures are shipped in double-box packaging with foam protection to minimize damage risk.'
      },
      {
        q: 'How long do refunds take?',
        a: 'Refunds are processed within 3–5 business days after we receive and inspect the returned item. JazzCash/EasyPaisa refunds are sent back to the original number. Card refunds appear within 5–10 business days depending on your bank.'
      },
    ]
  },
  {
    category: 'Account & Reviews',
    items: [
      {
        q: 'Do I need an account to order?',
        a: 'Yes, an account is required to place orders. This allows you to track your orders, manage your profile, and receive order notifications. Registration is quick and free.'
      },
      {
        q: 'How do I leave a review?',
        a: 'Reviews are restricted to verified buyers only. Once your order status is "Delivered", you can go to the product page and submit a star rating and comment. This ensures all reviews are genuine.'
      },
      {
        q: 'Can I delete my review?',
        a: 'Yes, you can delete your own reviews at any time from the product page.'
      },
    ]
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? 'rgba(229,9,20,0.04)' : '#111',
        border: `1px solid ${open ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 8
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: 16 }}>
        <p style={{ color: open ? '#fff' : 'rgba(255,255,255,0.8)', fontWeight: open ? 700 : 500, fontSize: 14, margin: 0, flex: 1 }}>{q}</p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} color={open ? '#e50914' : 'rgba(255,255,255,0.4)'} />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7, padding: '0 20px 16px', margin: 0 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  return (
    <main className="pt-16 min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20 mx-auto mb-6">
            <HelpCircle size={28} className="text-red-500" />
          </div>
          <h1 className="font-syne font-black text-5xl text-white mb-4">
            Frequently Asked <span className="text-red-500">Questions</span>
          </h1>
          <p className="text-white/45 text-sm leading-relaxed">
            Everything you need to know about RizerSpace — orders, payments, products, and more.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {FAQS.map(({ category, items }, ci) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 }}
            >
              <h2 className="font-syne font-black text-xl text-white mb-5 flex items-center gap-3">
                <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
                {category}
              </h2>
              {items.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-syne font-black text-2xl text-white mb-3">Still have a question?</h2>
          <p className="text-white/40 text-sm mb-8">Our support team is available 7 days a week and typically replies within 2 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:rizerspace50@gmail.com"
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Email Support <ArrowRight size={15} />
            </a>
            <Link to="/catalog" className="btn-secondary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
