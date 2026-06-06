import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User, Key, ArrowLeft, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { updateUser } from '../store/authSlice'

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 0
}
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }

const Card = ({ children, title, icon: Icon }) => (
  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      <Icon size={17} color="#e50914" />
      <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
)

export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  if (!user) return null

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.put('/auth/profile', { name })
      dispatch(updateUser({ name }))
      setProfileSaved(true)
      toast.success('Profile updated!')
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSavingPassword(true)
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      toast.success('Password changed successfully!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <main style={{ paddingTop: 80, minHeight: '100vh', background: '#080808' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 60px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, marginBottom: 28 }}>
          <ArrowLeft size={15} /> Home
        </Link>

        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 28px' }}>Account Settings</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile Info */}
          <Card title="Personal Details" icon={User}>
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input style={{ ...inputStyle, opacity: 0.45, cursor: 'not-allowed' }} value={user.email} disabled />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 5 }}>Email cannot be changed</p>
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'inline-block' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: user.role === 'admin' ? '#e50914' : '#60a5fa', textTransform: 'capitalize' }}>{user.role}</span>
                  </div>
                </div>
                <button type="submit" disabled={savingProfile} style={{
                  padding: '12px', borderRadius: 10, border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer',
                  background: profileSaved ? '#065f46' : '#e50914', color: '#fff', fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s'
                }}>
                  {profileSaved ? <><Check size={15} /> Saved!</> : savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card title="Change Password" icon={Key}>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input style={inputStyle} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min 8 characters" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input style={inputStyle} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <button type="submit" disabled={savingPassword} style={{
                  padding: '12px', borderRadius: 10, border: 'none', cursor: savingPassword ? 'not-allowed' : 'pointer',
                  background: savingPassword ? 'rgba(229,9,20,0.5)' : '#e50914', color: '#fff', fontWeight: 700, fontSize: 14
                }}>
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </main>
  )
}
