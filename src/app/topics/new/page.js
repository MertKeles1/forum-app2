'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function NewTopicPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  })
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
    // Geçici olarak auth kontrolünü kaldırıyoruz
    // checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (!response.ok) {
        console.log('Auth check failed, redirecting to login')
        router.push('/auth/login?message=Bu sayfaya erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      console.log('Auth error:', error)
      router.push('/auth/login?message=Bu sayfaya erişmek için giriş yapmalısınız')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Konu oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        <div className="max-w-2xl mx-auto">
          <h1 className="page-title mb-8">Yeni Konu Oluştur</h1>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Konu Başlığı
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Konunuzun başlığını girin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId" className="form-label">
                Kategori
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                İçerik
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="form-textarea"
                required
                placeholder="Konu içeriğinizi yazın..."
                rows="10"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-register flex-1"
              >
                {loading ? 'Oluşturuluyor...' : 'Konu Oluştur'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn btn-login flex-1"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}