import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Trash2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <Star size={22} fill={(hover || value) >= i ? '#fbbf24' : 'none'}
            className={(hover || value) >= i ? 'text-amber-400' : 'text-white/20'} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ productId }) {
  const { user } = useSelector(s => s.auth)
  const qc       = useQueryClient()
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [err, setErr]         = useState('')

  // Query reviews
  const { data: reviewsList, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/reviews/product/${productId}`).then(r => r.data.data),
  })

  // Query verified buyer eligibility
  const { data: eligibility, isLoading: isEligibilityLoading } = useQuery({
    queryKey: ['reviews-eligible', productId],
    queryFn: () => api.get(`/reviews/eligible/${productId}`).then(r => r.data),
    enabled: !!user,
  })

  const submitMut = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries(['reviews', productId])
      qc.invalidateQueries(['reviews-eligible', productId])
      qc.invalidateQueries(['product', productId]) // Refetch product details to update averageRating
      setRating(0)
      setComment('')
      setErr('')
      toast.success('Review submitted successfully!')
    },
    onError: (e) => setErr(e.response?.data?.error || 'Failed to submit review'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['reviews', productId])
      qc.invalidateQueries(['reviews-eligible', productId])
      qc.invalidateQueries(['product', productId])
      toast.success('Review deleted successfully')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete review')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rating) return setErr('Please select a star rating')
    if (!comment.trim()) return setErr('Please write a comment')
    setErr('')
    submitMut.mutate()
  }

  const eligible = eligibility?.eligible
  const reason = eligibility?.reason

  return (
    <div className="mt-12">
      
      {/* Write a review section */}
      {!user ? (
        <div className="glass rounded-2xl p-5 mb-8 border border-white/8 text-center text-sm text-white/40">
          <Link to="/login" className="text-neon-red hover:underline font-semibold">Sign in</Link> to write a review. Only verified buyers who purchased this product can leave a review.
        </div>
      ) : isEligibilityLoading ? (
        <div className="glass rounded-2xl p-5 mb-8 border border-white/8 text-center text-sm text-white/40">
          Checking review eligibility...
        </div>
      ) : eligible ? (
        <div className="glass rounded-2xl p-6 mb-8 border border-white/8">
          <h4 className="font-semibold text-sm text-white/70 mb-4 tracking-wide">WRITE A REVIEW</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <StarRating value={rating} onChange={setRating} />
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this figure..."
              rows={3} className="input-neon resize-none" />
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button type="submit" disabled={submitMut.isPending}
              className="btn-primary self-start flex items-center gap-2">
              <Send size={14} /> {submitMut.isPending ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 mb-8 border border-white/8 text-center text-sm text-white/40">
          🔒 {reason || "Only verified buyers who purchased this product can leave a review."}
        </div>
      )}

      {/* Reviews list */}
      {isReviewsLoading ? (
        <div className="text-white/40 text-sm">Loading reviews...</div>
      ) : reviewsList?.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm border border-white/5">
          No reviews yet. Be the first to review this figure!
        </div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {reviewsList?.map(rv => (
              <motion.div key={rv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-white/8">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-white">{rv.user?.name || 'Anonymous'}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill={i <= rv.rating ? '#fbbf24' : 'none'}
                          className={i <= rv.rating ? 'text-amber-400' : 'text-white/20'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">{new Date(rv.createdAt).toLocaleDateString()}</span>
                    {(user?._id === rv.user?._id || user?.role === 'admin') && (
                      <button onClick={() => deleteMut.mutate(rv._id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{rv.comment}</p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
