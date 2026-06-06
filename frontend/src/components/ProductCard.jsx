import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingCart, Star } from 'lucide-react'
import { addToCart } from '../store/cartSlice'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) {
      dispatch(addToCart(product))
      toast.success(`${product.title} added to cart!`)
    }
  }

  const displayPrice = product.discountedPrice || product.price
  const discountPct = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : null

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(229,9,20,0.4)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(229,9,20,0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#1a1a1a' }}>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                loading="lazy"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, opacity: 0.15 }}>📦</div>
            )}

            {/* Badges */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {discountPct && (
                <span style={{ background: '#e50914', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  -{discountPct}% OFF
                </span>
              )}
              {product.status === 'Pre-Order' && (
                <span style={{ background: 'rgba(96,165,250,0.9)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  PRE-ORDER
                </span>
              )}
            </div>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 20, letterSpacing: 1 }}>
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: '14px 16px 16px' }}>
            <p style={{ color: 'rgba(229,9,20,0.7)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.category}
            </p>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title}
            </h3>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 1 }}>
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={10}
                    fill={n <= Math.round(product.averageRating) ? '#e50914' : 'none'}
                    color={n <= Math.round(product.averageRating) ? '#e50914' : 'rgba(255,255,255,0.2)'}
                  />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>({product.numReviews || 0})</span>
            </div>

            {/* Price + Cart */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 17, fontWeight: 900 }}>
                  ${displayPrice.toFixed(2)}
                </span>
                {product.discountedPrice && (
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 12, textDecoration: 'line-through' }}>
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 8, border: 'none',
                  background: isOutOfStock ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#e50914,#a50010)',
                  color: isOutOfStock ? 'rgba(255,255,255,0.2)' : '#fff',
                  fontSize: 12, fontWeight: 700, cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                <ShoppingCart size={12} /> Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
