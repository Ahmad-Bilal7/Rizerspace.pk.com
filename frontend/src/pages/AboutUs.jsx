import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Shield, Star, Truck, Users, Award, ArrowRight, Mail } from 'lucide-react'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay }
})

const TEAM = [
  { name: 'Ahmad Bilal', role: 'Founder & CEO', emoji: '👨‍💻', desc: 'Full-stack developer and anime collector with a passion for bringing premium figures to Pakistan.' },
  { name: 'Curation Team', role: 'Product Specialists', emoji: '🎯', desc: 'Dedicated specialists who hand-pick every figure to ensure authenticity and quality.' },
  { name: 'Support Team', role: 'Customer Care', emoji: '💬', desc: '24/7 dedicated support to assist with orders, returns, and product queries.' },
]

const VALUES = [
  { icon: Shield, title: '100% Authentic',    desc: 'Every figure is officially licensed. We source directly from authorised distributors only.' },
  { icon: Star,   title: 'Curated Quality',   desc: 'We hand-select each product. If it is not museum grade, it does not make it to the shelf.' },
  { icon: Truck,  title: 'Secure Shipping',   desc: 'Double-box packaging with foam inserts. Your figures arrive pristine, every time.' },
  { icon: Users,  title: 'Community First',   desc: 'Built by collectors, for collectors. Our community shapes what we stock.' },
]

export default function AboutUs() {
  return (
    <main className="pt-16 overflow-x-hidden bg-black text-white">

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle,#DC2626,transparent)' }} />
        </div>
        <div className="max-w-4xl mx-auto w-full text-center">
          <motion.div {...fade(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
              <Zap size={12} className="text-red-500" />
              <span className="text-xs font-semibold text-red-500 tracking-widest">OUR STORY</span>
            </div>
            <h1 className="font-syne font-black text-5xl sm:text-6xl leading-tight tracking-tight mb-6">
              Built by Collectors,<br />
              <span className="text-red-600">For Collectors.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-2xl mx-auto">
              RizerSpace was born from frustration — premium anime figures were either unavailable in Pakistan or sold at inflated prices through grey markets. We changed that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fade(0.1)}>
              <p className="text-xs text-red-500 font-bold tracking-widest mb-3">WHO WE ARE</p>
              <h2 className="font-syne font-black text-3xl text-white mb-6">Pakistan's Premier<br />Anime Collectibles Store</h2>
              <div className="flex flex-col gap-4 text-white/50 text-sm leading-relaxed">
                <p>RizerSpace is a dedicated platform for anime action figures, statues, Nendoroids, and scale collectibles — officially licensed, authenticity guaranteed.</p>
                <p>We started in 2024 with a simple mission: give Pakistani collectors access to the same museum-grade figures that enthusiasts in Japan, the US, and EU enjoy — at fair prices with fast, secure delivery.</p>
                <p>Every product on our platform is carefully verified for authenticity. We work directly with licensed distributors and never deal in bootlegs or grey-market imports.</p>
              </div>
            </motion.div>
            <motion.div {...fade(0.2)} className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Premium Figures' },
                { value: '4.9★', label: 'Avg. Rating' },
                { value: '2024', label: 'Founded' },
                { value: '100%', label: 'Authentic' },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-6 border border-white/8 text-center">
                  <p className="font-syne font-black text-3xl text-red-500">{s.value}</p>
                  <p className="text-xs text-white/40 mt-1 font-bold tracking-wider uppercase">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade(0.1)} className="text-center mb-12">
            <p className="text-xs text-red-500 font-bold tracking-widest mb-2">WHAT DRIVES US</p>
            <h2 className="font-syne font-black text-3xl text-white">Our Core <span className="text-red-500">Values</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fade(0.1 + i * 0.05)}
                className="glass rounded-2xl p-6 border border-white/8 hover:border-red-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 mb-4">
                  <Icon size={18} className="text-red-500" />
                </div>
                <h3 className="font-syne font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fade(0.1)} className="text-center mb-12">
            <p className="text-xs text-red-500 font-bold tracking-widest mb-2">THE PEOPLE</p>
            <h2 className="font-syne font-black text-3xl text-white">Meet the <span className="text-red-500">Team</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map(({ name, role, emoji, desc }, i) => (
              <motion.div key={name} {...fade(0.1 + i * 0.07)}
                className="glass rounded-2xl p-6 border border-white/8 text-center hover:border-red-500/30 transition-all">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="font-syne font-black text-white text-base mb-1">{name}</h3>
                <p className="text-xs text-red-400 font-bold tracking-wider mb-3">{role}</p>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-black to-red-950/20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fade(0.1)}>
            <Award size={40} className="text-red-500 mx-auto mb-6 opacity-80" />
            <h2 className="font-syne font-black text-3xl text-white mb-4">Ready to Start Your Collection?</h2>
            <p className="text-white/40 text-sm mb-8">Browse our curated catalog of 500+ premium anime figures, statues, and collectibles.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
                Browse Catalog <ArrowRight size={16} />
              </Link>
              <a href="mailto:rizerspace50@gmail.com" className="btn-secondary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold">
                <Mail size={16} /> Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
