import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Loader2, Save, Package } from 'lucide-react'
import api from '../../services/api'
import AdminNav from '../../components/AdminNav'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Scale Figures', 'Nendoroids', 'Statues', 'Accessories',
  'Dragon Ball Z', 'Naruto', 'One Piece', 'Demon Slayer',
  'Attack on Titan', 'Jujutsu Kaisen', 'My Hero Academia', 'Bleach', 'One Punch Man'
]

const STATUS_OPTIONS = ['In-Stock', 'Pre-Order', 'Out-of-Stock']

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'Scale Figures',
  price: '',
  discountedPrice: '',
  stock: '',
  status: 'In-Stock',
  images: [''],
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', outline: 'none', boxSizing: 'border-box'
}
const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [err, setErr] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get(`/products?limit=10&page=${page}&search=${search}`).then(r => r.data)
  })

  const products = data?.data || []
  const totalPages = data?.pages || 1

  const createMut = useMutation({
    mutationFn: (p) => api.post('/products', p),
    onSuccess: () => { queryClient.invalidateQueries(['admin-products']); closeModal(); toast.success('Product created!') },
    onError: (e) => setErr(e.response?.data?.error || 'Failed to create product')
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/products/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries(['admin-products']); closeModal(); toast.success('Product updated!') },
    onError: (e) => setErr(e.response?.data?.error || 'Failed to update product')
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-products']); toast.success('Product deleted') },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete')
  })

  const openAdd = () => { setEditingId(null); setForm(INITIAL_FORM); setErr(''); setModalOpen(true) }
  const openEdit = (p) => {
    setEditingId(p._id)
    setForm({
      title: p.title, description: p.description, category: p.category,
      price: p.price, discountedPrice: p.discountedPrice || '',
      stock: p.stock, status: p.status || 'In-Stock',
      images: p.images?.length ? p.images : ['']
    })
    setErr(''); setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(INITIAL_FORM); setErr('') }

  const handleSubmit = (e) => {
    e.preventDefault(); setErr('')
    const payload = {
      title: form.title, description: form.description, category: form.category,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      stock: Number(form.stock), status: form.status,
      images: form.images.filter(i => i.trim())
    }
    if (!payload.images.length) payload.images = ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500']
    editingId ? updateMut.mutate({ id: editingId, payload }) : createMut.mutate(payload)
  }

  const handleImageChange = (idx, val) => {
    const imgs = [...form.images]; imgs[idx] = val
    setForm(f => ({ ...f, images: imgs }))
  }

  return (
    <main style={{ paddingTop: 80, paddingBottom: 60, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>Products</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Manage catalog, stock, pricing and images</p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: '#e50914', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Plus size={15} /> Add Product
          </button>
        </div>

        <AdminNav />

        {/* Search */}
        <div style={{ position: 'relative', margin: '20px 0' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by title, category..."
            style={{ ...inputStyle, paddingLeft: 36, fontSize: 14 }}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'rgba(255,255,255,0.4)' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} color="rgba(255,255,255,0.2)" /></div>
                            }
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: '2px 0 0', fontFamily: 'monospace' }}>…{p._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.65)' }}>{p.category}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>${(p.discountedPrice || p.price).toFixed(2)}</span>
                        {p.discountedPrice && <span style={{ display: 'block', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace', textDecoration: 'line-through' }}>${p.price.toFixed(2)}</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: p.stock === 0 ? '#f87171' : p.stock <= 5 ? '#fbbf24' : 'rgba(255,255,255,0.7)' }}>
                          {p.stock}
                          {p.stock <= 5 && p.stock > 0 && <span style={{ marginLeft: 4, fontSize: 9, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '1px 5px', borderRadius: 4 }}>LOW</span>}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                          background: p.status === 'In-Stock' ? 'rgba(52,211,153,0.1)' : p.status === 'Pre-Order' ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)',
                          color: p.status === 'In-Stock' ? '#34d399' : p.status === 'Pre-Order' ? '#60a5fa' : '#f87171'
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex' }} title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { if (window.confirm('Delete this product?')) deleteMut.mutate(p._id) }}
                            style={{ padding: 6, borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex' }} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                background: page === n ? '#e50914' : 'rgba(255,255,255,0.05)', color: page === n ? '#fff' : 'rgba(255,255,255,0.5)'
              }}>{n}</button>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Title + Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Goku Ultra Instinct" />
                  </div>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Describe the product..." />
                </div>

                {/* Price + Discounted Price + Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Price (USD) *</label>
                    <input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="89.99" />
                  </div>
                  <div>
                    <label style={labelStyle}>Sale Price (USD)</label>
                    <input style={inputStyle} type="number" step="0.01" min="0" value={form.discountedPrice} onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock *</label>
                    <input style={inputStyle} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required placeholder="20" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Images */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Image URLs</label>
                    <button type="button" onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                      style={{ fontSize: 11, color: '#e50914', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Add Image</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.images.map((url, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <input style={{ ...inputStyle, flex: 1 }} type="url" value={url} onChange={e => handleImageChange(i, e.target.value)} placeholder="https://..." />
                        {form.images.length > 1 && (
                          <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                            style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {err && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} /> {err}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                  <button type="button" onClick={closeModal}
                    style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: '#e50914', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {(createMut.isPending || updateMut.isPending) ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                    {editingId ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
