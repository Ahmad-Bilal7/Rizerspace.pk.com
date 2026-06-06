import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Truck, RotateCcw, Star, Mail } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import toast from 'react-hot-toast'

const HOME_CATEGORIES = [
  { name: 'Anime Figures', icon: '🎎', desc: 'Premium articulated & prize figures' },
  { name: 'Statues', icon: '🗿', desc: 'Highly detailed resin & PVC statues' },
  { name: 'Nendoroids', icon: '🧸', desc: 'Cute chibi-style figures' },
  { name: 'Scale Figures', icon: '📏', desc: 'Exquisite scaled replicas' },
  { name: 'Accessories', icon: '🎒', desc: 'Display cases & collectibles extras' }
]

const STAT_ITEMS = [
  { value: '500+', label: 'Premium Figures' },
  { value: '4.9★', label: 'Satisfaction' },
  { value: 'Fast', label: 'Worldwide Shipping' },
  { value: '100%', label: 'Authentic Gear' },
]

const TRUST_ITEMS = [
  { icon: Truck,     title: 'Free Worldwide Shipping', sub: 'On all orders over $75' },
  { icon: Shield,    title: 'Secure Checkout',         sub: '256-bit SSL encryption' },
  { icon: RotateCcw, title: '30-Day Returns',          sub: 'No questions asked return policy' },
  { icon: Star,      title: '100% Authentic',          sub: 'Officially licensed collectibles only' },
]

export default function Home() {
  const [email, setEmail] = useState('')

  // 1. Featured Figures (Latest 8 products)
  const { data: featured, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products?limit=8').then(r => r.data.data),
  })

  // 2. Best Sellers (Top-selling products)
  const { data: bestSellers, isLoading: isLoadingBestSellers } = useQuery({
    queryKey: ['products', 'bestSellers'],
    queryFn: () => api.get('/products?sort=best-sellers&limit=4').then(r => r.data.data),
  })

  // 3. New Arrivals (Recently added products)
  const { data: newArrivals, isLoading: isLoadingNewArrivals } = useQuery({
    queryKey: ['products', 'newArrivals'],
    queryFn: () => api.get('/products?sort=newest&limit=4').then(r => r.data.data),
  })

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('Welcome to RizerSpace! Check your inbox for exclusive release alerts.')
    setEmail('')
  }

  // Loader card grid helper
  const renderPlaceholders = (count = 4) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl h-72 animate-pulse border border-white/5 bg-white/2" />
      ))}
    </div>
  )

  // Empty state builder helper
  const renderEmptyState = (title = "No figures available") => (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-white/2 rounded-2xl p-8">
      <div className="text-4xl mb-3 opacity-30">📦</div>
      <h3 className="font-syne font-bold text-lg text-white/50 mb-1">{title}</h3>
      <p className="text-white/30 text-xs max-w-xs">New stock is arriving soon. Sign up for our newsletter to get restock notifications first.</p>
    </div>
  )

  return (
    <main className="pt-16 overflow-x-hidden bg-black text-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{background:'radial-gradient(circle,#DC2626,transparent)'}} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{background:'radial-gradient(circle,#7F1D1D,transparent)'}} />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12">
          <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.8}}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
              <Zap size={12} className="text-red-500" />
              <span className="text-xs font-semibold text-red-500 tracking-widest">RIZERSPACE AUTHENTICS</span>
            </div>
            <h1 className="font-syne font-black text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-6">
              Empower Your<br />
              <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">Collectibles.</span><br />
              <span className="text-white/60">Museum Grade.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-lg mb-8">
              Officially licensed anime figures, statues, and high-end collectibles. Curated from premium brands shipped globally under secure double-box packaging.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary flex items-center gap-2 font-bold px-6 py-3 rounded-xl">
                Browse Shop <ArrowRight size={16} />
              </Link>
              <Link to="/catalog?sort=newest" className="btn-secondary font-bold px-6 py-3 rounded-xl">New Arrivals</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/5">
              {STAT_ITEMS.map(s => (
                <div key={s.label}>
                  <div className="font-syne font-black text-2xl text-red-500">{s.value}</div>
                  <div className="text-[10px] text-white/40 tracking-wider font-bold uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}}
            className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-96 h-96 flex items-center justify-center">
              {/* Outer decorative neon border */}
              <div className="absolute inset-0 rounded-3xl animate-pulse border-2 border-red-600/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]" />
              <div className="absolute inset-4 rounded-3xl" style={{background:'linear-gradient(135deg,rgba(220,38,38,0.1),rgba(0,0,0,0.8))',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.05)'}} />
              <div className="relative text-center z-10 p-8">
                <span className="text-[72px] font-black opacity-20 select-none leading-none text-red-600 font-syne">RIZER</span>
                <div className="font-syne font-bold text-lg text-white tracking-widest uppercase mt-4">RIZER HUB</div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Premium Otaku Gear</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BROWSE CATEGORIES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs text-red-500 font-bold tracking-widest mb-1">CATEGORIES</p>
            <h2 className="font-syne font-black text-3xl text-white">Browse <span className="text-red-500">Departments</span></h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {HOME_CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Link to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl glass border border-white/8 hover:border-red-500/50 hover:bg-red-500/[0.03] transition-all duration-300 text-center h-48">
                  <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <span className="font-syne font-bold text-sm text-white group-hover:text-red-400 transition-colors">{cat.name}</span>
                  <span className="text-[10px] text-white/30 mt-2 line-clamp-2">{cat.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED FIGURES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-red-500 font-bold tracking-widest mb-1">LATEST MASTERPIECES</p>
              <h2 className="font-syne font-black text-3xl text-white">Featured <span className="text-red-500">Figures</span></h2>
            </div>
            <Link to="/catalog" className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-1">
              View Entire Catalog <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingFeatured ? (
            renderPlaceholders(8)
          ) : featured?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((p, i) => (
                <motion.div key={p._id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            renderEmptyState("No featured figures found")
          )}
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs text-red-500 font-bold tracking-widest mb-1">MOST COLLECTED</p>
            <h2 className="font-syne font-black text-3xl text-white">Best <span className="text-red-500">Sellers</span></h2>
          </div>

          {isLoadingBestSellers ? (
            renderPlaceholders(4)
          ) : bestSellers?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((p, i) => (
                <motion.div key={p._id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            renderEmptyState("No best sellers available")
          )}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-red-500 font-bold tracking-widest mb-1">RECENT RELEASES</p>
              <h2 className="font-syne font-black text-3xl text-white">New <span className="text-red-500">Arrivals</span></h2>
            </div>
            <Link to="/catalog?sort=newest" className="btn-secondary !py-2 !px-4 !text-xs flex items-center gap-1">
              Explore All New <ArrowRight size={12} />
            </Link>
          </div>

          {isLoadingNewArrivals ? (
            renderPlaceholders(4)
          ) : newArrivals?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newArrivals.map((p, i) => (
                <motion.div key={p._id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            renderEmptyState("No new arrivals found")
          )}
        </div>
      </section>

      {/* ── NEWSLETTER STRIP ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-black to-red-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-3 rounded-full bg-red-600/10 border border-red-500/20 mb-6 text-red-500">
            <Mail size={24} />
          </div>
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-white mb-3">
            Join the <span className="text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.2)]">Inner Circle</span>
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Subscribe to our newsletter to receive early-bird pre-order invitations, rare restocking alerts, and members-only discount coupons.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-neon flex-1 text-sm rounded-xl py-3 px-4"
            />
            <button type="submit" className="btn-primary py-3 px-6 rounded-xl text-sm font-syne font-bold flex items-center justify-center gap-2">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/10 border border-red-500/20">
                  <Icon size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-syne font-bold text-sm text-white">{title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
