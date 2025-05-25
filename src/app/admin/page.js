'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    topics: 0,
    messages: 0,
    categories: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentTopics, setRecentTopics] = useState([])
  const [loading, setLoading] = useState(true)
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
        fetchStats()
        fetchRecentData()
      } else {
        router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  const fetchRecentData = async () => {
    try {
      const [usersRes, topicsRes] = await Promise.all([
        fetch('/api/admin/recent-users'),
        fetch('/api/admin/recent-topics')
      ])

      if (usersRes.ok) {
        const users = await usersRes.json()
        setRecentUsers(users)
      }

      if (topicsRes.ok) {
        const topics = await topicsRes.json()
        setRecentTopics(topics)
      }
    } catch (error) {
      console.error('Failed to fetch recent data')
    } finally {
      setLoading(false)
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="page-title">Admin Paneli</h1>
          <div className="text-sm text-gray-400">
            Hoş geldin, Admin! 🛡️
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-white">{stats.users}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Konu</p>
                <p className="text-2xl font-bold text-white">{stats.topics}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Mesaj</p>
                <p className="text-2xl font-bold text-white">{stats.messages}</p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Kategori</p>
                <p className="text-2xl font-bold text-white">{stats.categories}</p>
              </div>
              <div className="text-3xl">📂</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/users" className="bg-gray-900/50 border border-white/10 rounded-none p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="text-white font-medium">Kullanıcı Yönetimi</h3>
                <p className="text-gray-400 text-sm">Kullanıcıları görüntüle ve yönet</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/categories" className="bg-gray-900/50 border border-white/10 rounded-none p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📂</div>
              <div>
                <h3 className="text-white font-medium">Kategori Yönetimi</h3>
                <p className="text-gray-400 text-sm">Kategorileri ekle ve düzenle</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/topics" className="bg-gray-900/50 border border-white/10 rounded-none p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <h3 className="text-white font-medium">Konu Yönetimi</h3>
                <p className="text-gray-400 text-sm">Konuları görüntüle ve yönet</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <h2 className="text-white font-medium mb-4">Son Kayıt Olan Kullanıcılar</h2>
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/30 border border-white/5 rounded-none">
                  <div>
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <h2 className="text-white font-medium mb-4">Son Oluşturulan Konular</h2>
            <div className="space-y-3">
              {recentTopics.slice(0, 5).map((topic) => (
                <div key={topic.id} className="p-3 bg-gray-800/30 border border-white/5 rounded-none">
                  <Link href={`/topics/${topic.id}`} className="block hover:text-gray-300 transition-colors">
                    <div className="text-white font-medium mb-1">{topic.title}</div>
                    <div className="text-gray-400 text-sm">
                      {topic.author.username} • {formatDate(topic.createdAt)}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}