import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Package, Bell, Check } from 'lucide-react'
import { logout } from '../store/authSlice'
import { selectCartCount } from '../store/cartSlice'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../services/api'

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useSelector(s => s.auth)
  const cartCount = useSelector(selectCartCount)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  // Query notifications
  const { data: notificationsData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data),
    enabled: !!user,
    refetchInterval: 12000 // poll every 12 seconds
  })

  // Mark read mutation
  const markReadMut = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      refetchNotifs()
    }
  })

  const notificationsList = notificationsData || []
  const unreadCount = notificationsList.filter(n => !n.read).length

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setUserMenu(false)
    setNotifOpen(false)
  }

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/catalog', label: 'Browse' },
  ]

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/src/assets/logo.png" alt="RizerSpace Logo" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px', color: '#fff' }}>
              RIZER<span style={{ color: '#e50914' }}>SPACE</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-desktop">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={{
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                color: isActive(l.to) ? '#e50914' : 'rgba(255,255,255,0.6)',
                transition: 'color 0.2s'
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', padding: 8, color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#e50914', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{cartCount}</span>
              )}
            </Link>

            {/* Notification Bell Dropdown */}
            {user && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setNotifOpen(!notifOpen); setUserMenu(false) }} style={{ position: 'relative', padding: 8, color: 'rgba(255,255,255,0.6)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#e50914', color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{unreadCount}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: 'absolute', right: -60, top: '100%', marginTop: 8,
                        width: 320, background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        zIndex: 100
                      }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Notifications</span>
                        {unreadCount > 0 && <span style={{ fontSize: 10, background: '#e50914', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>{unreadCount} unread</span>}
                      </div>
                      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {notificationsList.length === 0 ? (
                          <div style={{ padding: '24px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
                            No notifications yet
                          </div>
                        ) : (
                          notificationsList.map(n => (
                            <div key={n._id} style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              background: n.read ? 'transparent' : 'rgba(229,9,20,0.03)',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: 0, fontSize: 12, color: n.read ? 'rgba(255,255,255,0.8)' : '#fff', fontWeight: n.read ? 600 : 800 }}>{n.title}</h4>
                                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{n.message}</p>
                                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: 4 }}>
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {!n.read && (
                                  <button onClick={(e) => { e.stopPropagation(); markReadMut.mutate(n._id) }} style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 4, padding: '2px 4px', color: '#34d399', cursor: 'pointer', display: 'flex'
                                  }} title="Mark as read">
                                    <Check size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setUserMenu(!userMenu); setNotifOpen(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>
                  <User size={14} color="#e50914" />
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        width: 200, background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                      }}>
                      {user.role === 'admin' && (
                        <Link to="/admin/dashboard" onClick={() => setUserMenu(false)} style={menuItemStyle}>
                          <LayoutDashboard size={14} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setUserMenu(false)} style={menuItemStyle}>
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenu(false)} style={menuItemStyle}>
                        <Package size={14} /> My Orders
                      </Link>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                      <button onClick={handleLogout} style={{ ...menuItemStyle, width: '100%', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" style={{
                padding: '7px 16px', borderRadius: 8,
                background: '#e50914', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none'
              }}>Sign In</Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none', padding: 8, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
              className="nav-hamburger">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  style={{ padding: '10px 8px', fontSize: 14, fontWeight: 500, textDecoration: 'none', color: isActive(l.to) ? '#e50914' : 'rgba(255,255,255,0.7)' }}>
                  {l.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} style={{ padding: '10px 8px', fontSize: 14, textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>My Orders</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ padding: '10px 8px', fontSize: 14, textDecoration: 'none', color: 'rgba(255,255,255,0.7)' }}>Profile</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)',
  textDecoration: 'none', transition: 'background 0.15s'
}
