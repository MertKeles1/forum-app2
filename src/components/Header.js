'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Logout attempt started')
      
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Logout response status:', response.status)

      if (response.ok) {
        console.log('Logout successful')
        setUser(null)
        // Sayfayı yeniden yükleyerek tüm state'i temizle
        window.location.href = '/'
      } else {
        console.error('Logout failed with status:', response.status)
        const errorData = await response.json()
        console.error('Logout error:', errorData)
        alert('Çıkış yapılırken bir hata oluştu')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Hata durumunda da çıkış yap
      setUser(null)
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <header className="header">
        <Link href="/" className="logo">
          💬 Forum
        </Link>
        <div className="text-gray-400">Yükleniyor...</div>
      </header>
    )
  }

  return (
    <header className="header">
      <Link href="/" className="logo">
        💬 Forum
      </Link>
      
      <div className="auth-buttons">
        {user ? (
          <>
            <span className="text-gray-400 text-sm mr-4">
              Hoş geldin, {user.username}
            </span>
            <Link href="/profile" className="btn btn-login">
              Profil
            </Link>
            <Link href="/messages" className="btn btn-login">
              Mesajlar
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="btn btn-login">
                Admin
              </Link>
            )}
            <button 
              onClick={handleLogout} 
              className="btn btn-register"
              type="button"
            >
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-login">
              Giriş Yap
            </Link>
            <Link href="/auth/register" className="btn btn-register">
              Üye Ol
            </Link>
          </>
        )}
      </div>
    </header>
  )
}