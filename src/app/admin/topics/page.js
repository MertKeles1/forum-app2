'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredTopics, setFilteredTopics] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (topics) {
      filterTopics()
    }
  }, [topics, selectedCategory, searchTerm])

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
        setIsAuthenticated(true)
        fetchTopics()
        fetchCategories()
      } else {
        router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics')
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('Failed to fetch topics')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  const filterTopics = () => {
    let filtered = topics

    if (selectedCategory) {
      filtered = filtered.filter(topic => topic.categoryId === parseInt(selectedCategory))
    }

    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.author.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTopics(filtered)
  }

  const handleDeleteTopic = async (topicId) => {
    const topic = topics.find(t => t.id === topicId)
    
    if (!confirm(`"${topic.title}" konusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yanıtlar da silinecek.`)) {
      return
    }

    setActionLoading(topicId)
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTopics(topics.filter(topic => topic.id !== topicId))
        alert('Konu başarıyla silindi')
      } else {
        const data = await response.json()
        alert(data.error || 'Konu silinirken bir hata oluştu')
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <Header />
        <main className="main-content">
          <div className="text-white text-center py-8">Yetkilendirme kontrol ediliyor...</div>
        </main>
      </div>
    )
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
          <h1 className="page-title">Konu Yönetimi</h1>
        </div>

        {/* Filters */}
        <div className="admin-card mb-6">
          <h2 className="text-white font-medium mb-4">Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Arama</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                placeholder="Konu başlığı veya yazar adı..."
              />
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-medium">
              Konular ({filteredTopics.length})
            </h2>
            <div className="text-sm text-gray-400">
              💡 Konuları silmek tüm yanıtları da siler
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 p-4">ID</th>
                  <th className="text-left text-gray-400 p-4">Başlık</th>
                  <th className="text-left text-gray-400 p-4">Yazar</th>
                  <th className="text-left text-gray-400 p-4">Kategori</th>
                  <th className="text-left text-gray-400 p-4">Yanıtlar</th>
                  <th className="text-left text-gray-400 p-4">Görüntüleme</th>
                  <th className="text-left text-gray-400 p-4">Tarih</th>
                  <th className="text-left text-gray-400 p-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => (
                  <tr key={topic.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="text-white p-4">#{topic.id}</td>
                    <td className="text-white p-4">
                      <Link 
                        href={`/topics/${topic.id}`}
                        className="hover:text-blue-400 transition-colors"
                        target="_blank"
                      >
                        <div className="font-medium max-w-xs truncate">
                          {topic.title}
                        </div>
                      </Link>
                    </td>
                    <td className="text-gray-300 p-4">{topic.author.username}</td>
                    <td className="p-4">
                      <span className="category-tag">
                        {topic.category.name}
                      </span>
                    </td>
                    <td className="text-gray-300 p-4">{topic._count?.replies || 0}</td>
                    <td className="text-gray-300 p-4">{topic.views}</td>
                    <td className="text-gray-300 p-4 text-sm">
                      {formatDate(topic.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/topics/${topic.id}`}
                          target="_blank"
                          className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded"
                        >
                          Görüntüle
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          disabled={actionLoading === topic.id}
                          className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
                        >
                          {actionLoading === topic.id ? '...' : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm || selectedCategory ? 'Filtrelere uygun konu bulunamadı' : 'Henüz konu bulunmuyor'}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="admin-card text-center">
            <div className="text-2xl font-bold text-white">
              {topics.length}
            </div>
            <div className="text-gray-400 text-sm">Toplam Konu</div>
          </div>
          
          <div className="admin-card text-center">
            <div className="text-2xl font-bold text-white">
              {topics.reduce((sum, topic) => sum + (topic._count?.replies || 0), 0)}
            </div>
            <div className="text-gray-400 text-sm">Toplam Yanıt</div>
          </div>
          
          <div className="admin-card text-center">
            <div className="text-2xl font-bold text-white">
              {topics.reduce((sum, topic) => sum + topic.views, 0)}
            </div>
            <div className="text-gray-400 text-sm">Toplam Görüntüleme</div>
          </div>
          
          <div className="admin-card text-center">
            <div className="text-2xl font-bold text-white">
              {topics.filter(topic => {
                const date = new Date(topic.createdAt)
                const today = new Date()
                return date.toDateString() === today.toDateString()
              }).length}
            </div>
            <div className="text-gray-400 text-sm">Bugünkü Konular</div>
          </div>
        </div>
      </main>
    </div>
  )
}