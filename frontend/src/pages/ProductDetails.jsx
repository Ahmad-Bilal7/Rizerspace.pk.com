import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Package, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { addToCart } from '../store/cartSlice'
import ReviewSection from '../components/ReviewSection'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  'In-Stock':    { color: '#34d399', background: 'rgba(52,211,153,0.1)',  border: '1px solid rgba(52,211,153,0.25)' },
  'Pre-Order':   { color: '#60a5fa', background: 'rgba(96,165,250,0.1)',  border: '1px solid rgba(96,165,250,0.25)' },
  'Out-of-Stock':{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' },
}

const StarRating = ({ rating = 0, count = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={15}
        fill={n <= Math.round(rating) ? '#fbbf24' : 'none'}
        color={n <= Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
      />
    ))}
    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>
      {rating.toFixed(1)} ({count} reviews)
    </span>
  </div>
)

export default function ProductDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
  })

  const { data: related } = useQuery({
    queryKey: ['products-related', product?.category],
    queryFn: () => api.get(`/products?category=${encodeURIComponent(product.category)}&limit=4`).then(r => r.data.data),
    enabled: !!product?.category,
  })

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    dispatch(addToCart({ ...product, quantity: qty }))
    setAdded(true)
    toast.success(`${product.title} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#e50914" style={{ animation: 'spin 1s linear infinite' }} />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>Product not found.</p>
          <Link to="/catalog" style={{ color: '#e50914', fontWeight: 600, textDecoration: 'none' }}>← Back to Catalog</Link>
        </div>
      </main>
    )
  }

  const images = product.images || []
  const statusStyle = statusColors[product.status] || statusColors['In-Stock']
  const displayPrice = product.discountedPrice || product.price
  const inStock = product.stock > 0

  return (
    <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 28, padding: 0 }}>
          <ArrowLeft size={15} /> Back
        </button>

        {/* ── Product Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 60 }}>

          {/* Left — Image Gallery */}
          <div>
            {/* Main Image */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.08)', aspectRatio: '1', marginBottom: 12 }}>
              {images.length > 0 ? (
                <motion.img
                  key={imgIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={images[imgIdx]}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 48 }}>📦</div>
              )}

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{
                    width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                    border: i === imgIdx ? '2px solid #e50914' : '2px solid rgba(255,255,255,0.1)',
                    padding: 0, cursor: 'pointer', background: '#111'
                  }}>
                    <img src={img} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Category + Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}
                style={{ fontSize: 11, fontWeight: 700, color: '#e50914', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
                {product.category}
              </Link>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, ...statusStyle }}>
                {product.status}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{product.title}</h1>

            {/* Rating */}
            <StarRating rating={product.averageRating} count={product.numReviews} />

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: '#e50914', fontFamily: 'monospace', fontSize: 32, fontWeight: 900 }}>${displayPrice.toFixed(2)}</span>
              {product.discountedPrice && (
                <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 18, textDecoration: 'line-through' }}>${product.price.toFixed(2)}</span>
              )}
              {product.discountedPrice && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(229,9,20,0.15)', color: '#e50914' }}>
                  -{Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{product.description}</p>

            {/* Stock Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={14} color={inStock ? '#34d399' : '#f87171'} />
              <span style={{ fontSize: 13, color: inStock ? '#34d399' : '#f87171', fontWeight: 600 }}>
                {inStock ? `${product.stock} units in stock` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 40, height: 44, background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ width: 40, height: 44, background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>+</button>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} disabled={!inStock}
                style={{
                  flex: 1, padding: '12px 24px', borderRadius: 10, border: 'none', cursor: inStock ? 'pointer' : 'not-allowed',
                  background: added ? '#065f46' : inStock ? '#e50914' : 'rgba(255,255,255,0.1)',
                  color: inStock ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s'
                }}>
                <ShoppingCart size={17} />
                {added ? 'Added!' : !inStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Cart shortcut */}
            {added && (
              <Link to="/cart" style={{ textAlign: 'center', color: '#e50914', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                View Cart →
              </Link>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 24px' }}>Customer Reviews</h2>
          <ReviewSection productId={id} />
        </div>

        {/* ── Related Products ── */}
        {related?.filter(r => r._id !== id).length > 0 && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 24px' }}>
              More in <span style={{ color: '#e50914' }}>{product.category}</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {related.filter(r => r._id !== id).slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
