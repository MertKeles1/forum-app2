'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const user = await response.json()
        if (user.role !== 'admin') {
          router.push('/?error=Bu sayfaya erişim yetkiniz yok')
          return
        }
        setCurrentUser(user)
        fetchUsers()
      } else {
        router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
        alert('Kullanıcı başarıyla silindi')
      } else {
        const data = await response.json()
        alert(data.error || 'Kullanıcı silinirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Bu kullanıcının rolünü ${newRole} yapmak istediğinizden emin misiniz?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(user => 
          user.id === userId ? updatedUser : user
        ))
        alert('Kullanıcı rolü başarıyla güncellendi')
      } else {
        const data = await response.json()
        alert(data.error || 'Rol güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
            ← Admin Paneli
          </Link>
          <h1 className="page-title">Kullanıcı Yönetimi</h1>
        </div>

        <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-medium">
              Tüm Kullanıcılar ({users.length})
            </h2>
            <div className="text-sm text-gray-400">
              💡 Kendi rolünüzü değiştiremezsiniz
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 p-4">ID</th>
                  <th className="text-left text-gray-400 p-4">Kullanıcı Adı</th>
                  <th className="text-left text-gray-400 p-4">E-posta</th>
                  <th className="text-left text-gray-400 p-4">Rol</th>
                  <th className="text-left text-gray-400 p-4">Kayıt Tarihi</th>
                  <th className="text-left text-gray-400 p-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="text-white p-4">#{user.id}</td>
                    <td className="text-white p-4 font-medium">{user.username}</td>
                    <td className="text-gray-300 p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </td>
                    <td className="text-gray-300 p-4">{formatDate(user.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Role Change Button */}
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleChangeRole(
                              user.id, 
                              user.role === 'admin' ? 'user' : 'admin'
                            )}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : (
                              user.role === 'admin' ? 'Kullanıcı Yap' : 'Admin Yap'
                            )}
                          </button>
                        )}

                        {/* Delete Button */}
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Sil'}
                          </button>
                        )}

                        {/* Current User Label */}
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-gray-400 italic">
                            (Sen)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Henüz kullanıcı bulunmuyor
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-900/30 border border-white/10 rounded-none p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-gray-400 text-sm">Admin</div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 border border-white/10 rounded-none p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'user').length}
              </div>
              <div className="text-gray-400 text-sm">Kullanıcı</div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 border border-white/10 rounded-none p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {users.length}
              </div>
              <div className="text-gray-400 text-sm">Toplam</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}