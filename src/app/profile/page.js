'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [userStats, setUserStats] = useState({})
  const [recentTopics, setRecentTopics] = useState([])
  const [recentReplies, setRecentReplies] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          username: userData.username,
          email: userData.email
        })
        fetchUserStats()
        fetchUserActivity()
      } else {
        router.push('/auth/login?message=Profil sayfasına erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Profil sayfasına erişmek için giriş yapmalısınız')
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats')
    }
  }

  const fetchUserActivity = async () => {
    try {
      const [topicsRes, repliesRes] = await Promise.all([
        fetch('/api/user/topics'),
        fetch('/api/user/replies')
      ])

      if (topicsRes.ok) {
        const topics = await topicsRes.json()
        setRecentTopics(topics)
      }

      if (repliesRes.ok) {
        const replies = await repliesRes.json()
        setRecentReplies(replies)
      }
    } catch (error) {
      console.error('Failed to fetch user activity')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setUpdating(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setEditMode(false)
        setMessage('Profil başarıyla güncellendi')
      } else {
        setError(data.error || 'Profil güncellenirken bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır')
      return
    }

    setUpdating(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setMessage('Şifre başarıyla değiştirildi')
      } else {
        setError(data.error || 'Şifre değiştirilirken bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container">
        <Header />
        <main className="main-content">
          <div className="text-white text-center py-8">Yükleniyor...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        <h1 className="page-title mb-8">Profil</h1>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-medium">Temel Bilgiler</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn btn-login"
                  >
                    Düzenle
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="form-input"
                      required
                      minLength="3"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">E-posta</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-register"
                    >
                      {updating ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          username: user.username,
                          email: user.email
                        })
                      }}
                      className="btn btn-login"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Kullanıcı Adı</label>
                    <div className="text-white">{user.username}</div>
                  </div>
                  <div>
                    <label className="form-label">E-posta</label>
                    <div className="text-white">{user.email}</div>
                  </div>
                  <div>
                    <label className="form-label">Rol</label>
                    <div className="text-white">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Kayıt Tarihi</label>
                    <div className="text-white">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
              <h2 className="text-white font-medium mb-6">Şifre Değiştir</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yeni Şifre</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="form-input"
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-input"
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-register"
                >
                  {updating ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
                </button>
              </form>
            </div>
          </div>

          {/* Stats & Activity */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
              <h2 className="text-white font-medium mb-4">İstatistikler</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Konular</span>
                  <span className="text-white font-medium">{userStats.topics || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Yanıtlar</span>
                  <span className="text-white font-medium">{userStats.replies || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mesajlar</span>
                  <span className="text-white font-medium">{userStats.messages || 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Topics */}
            <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
              <h2 className="text-white font-medium mb-4">Son Konularım</h2>
              <div className="space-y-2">
                {recentTopics.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="p-2 bg-gray-800/30 border border-white/5 rounded-none">
                    <Link href={`/topics/${topic.id}`} className="block hover:text-gray-300 transition-colors">
                      <div className="text-white text-sm font-medium mb-1">
                        {topic.title}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatDateTime(topic.createdAt)}
                      </div>
                    </Link>
                  </div>
                ))}
                {recentTopics.length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-4">
                    Henüz konu oluşturmamışsınız
                  </div>
                )}
              </div>
            </div>

            {/* Recent Replies */}
            <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
              <h2 className="text-white font-medium mb-4">Son Yanıtlarım</h2>
              <div className="space-y-2">
                {recentReplies.slice(0, 5).map((reply) => (
                  <div key={reply.id} className="p-2 bg-gray-800/30 border border-white/5 rounded-none">
                    <Link href={`/topics/${reply.topic.id}`} className="block hover:text-gray-300 transition-colors">
                      <div className="text-white text-sm">
                        {reply.topic.title}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {formatDateTime(reply.createdAt)}
                      </div>
                    </Link>
                  </div>
                ))}
                {recentReplies.length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-4">
                    Henüz yanıt yazmamışsınız
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}