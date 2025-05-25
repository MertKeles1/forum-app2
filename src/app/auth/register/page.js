'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/auth/login?message=Kayıt başarılı! Giriş yapabilirsiniz.')
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu')
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
        <div className="max-w-md mx-auto">
          <h1 className="page-title text-center mb-8">Üye Ol</h1>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
                minLength="3"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="E-posta adresinizi girin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength="6"
                placeholder="En az 6 karakter"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-register w-full"
            >
              {loading ? 'Kaydediliyor...' : 'Üye Ol'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/auth/login" className="text-white hover:underline">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}