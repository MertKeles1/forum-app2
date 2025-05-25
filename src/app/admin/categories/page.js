'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState('')
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
        fetchCategories()
      } else {
        router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Admin paneline erişmek için giriş yapmalısınız')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setActionLoading('create')
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
        setNewCategoryName('')
        alert('Kategori başarıyla oluşturuldu')
      } else {
        const data = await response.json()
        alert(data.error || 'Kategori oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateCategory = async (categoryId) => {
    if (!editName.trim()) return

    setActionLoading(categoryId)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName.trim() })
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ))
        setEditingCategory(null)
        setEditName('')
        alert('Kategori başarıyla güncellendi')
      } else {
        const data = await response.json()
        alert(data.error || 'Kategori güncellenirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    
    if (category._count?.topics > 0) {
      if (!confirm(`Bu kategoride ${category._count.topics} konu var. Kategoriyi silmek bu konuları da silecek. Emin misiniz?`)) {
        return
      }
    } else {
      if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
        return
      }
    }

    setActionLoading(categoryId)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        alert('Kategori başarıyla silindi')
      } else {
        const data = await response.json()
        alert(data.error || 'Kategori silinirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setActionLoading(null)
    }
  }

  const startEdit = (category) => {
    setEditingCategory(category.id)
    setEditName(category.name)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditName('')
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
          <h1 className="page-title">Kategori Yönetimi</h1>
        </div>

        {/* Create New Category */}
        <div className="bg-gray-900/50 border border-white/10 rounded-none p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Yeni Kategori Oluştur</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="form-input flex-1"
              placeholder="Kategori adı..."
              required
            />
            <button
              type="submit"
              disabled={actionLoading === 'create' || !newCategoryName.trim()}
              className="btn btn-register px-6"
            >
              {actionLoading === 'create' ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-medium">
              Kategoriler ({categories.length})
            </h2>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-800/30 border border-white/5 rounded-none p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingCategory === category.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="form-input flex-1"
                          placeholder="Kategori adı..."
                        />
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={actionLoading === category.id || !editName.trim()}
                          className="btn btn-register px-4"
                        >
                          {actionLoading === category.id ? '...' : 'Kaydet'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn btn-login px-4"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-white font-medium text-lg">
                          {category.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {category._count?.topics || 0} konu
                        </p>
                      </div>
                    )}
                  </div>

                  {editingCategory !== category.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        disabled={actionLoading === category.id}
                        className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={actionLoading === category.id}
                        className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === category.id ? '...' : 'Sil'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Henüz kategori bulunmuyor
            </div>
          )}
        </div>
      </main>
    </div>
  )
}