'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function TopicDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [topic, setTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyLoading, setReplyLoading] = useState(false)
  const [viewIncremented, setViewIncremented] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTopic()
      fetchReplies()
      checkAuth()
    }
  }, [id])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.log('Not logged in')
    }
  }

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTopic(data)
        
        // View count'u sadece bir kez increment et
        if (!viewIncremented) {
          incrementViewCount()
          setViewIncremented(true)
        }
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch topic')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async () => {
    try {
      // Client-side duplicate protection
      const viewedKey = `topic_viewed_${id}`
      const lastViewed = sessionStorage.getItem(viewedKey)
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (lastViewed && (now - parseInt(lastViewed)) < fiveMinutes) {
        console.log('View already counted recently (client-side)')
        return
      }
      
      await fetch(`/api/topics/${id}/view`, { 
        method: 'POST',
        cache: 'no-store'
      })
      
      // Mark as viewed in sessionStorage
      sessionStorage.setItem(viewedKey, now.toString())
      console.log('View count incremented')
    } catch (error) {
      console.error('Failed to increment view count')
    }
  }

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/topics/${id}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
      }
    } catch (error) {
      console.error('Failed to fetch replies')
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!newReply.trim() || !user) return

    setReplyLoading(true)
    try {
      const response = await fetch(`/api/topics/${id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newReply })
      })

      if (response.ok) {
        setNewReply('')
        fetchReplies() // Refresh replies
      } else {
        alert('Yanıt gönderilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setReplyLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
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

  if (!topic) {
    return (
      <div className="container">
        <Header />
        <main className="main-content">
          <div className="text-white text-center py-8">Konu bulunamadı</div>
        </main>
      </div>
    )
  }

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        {/* Topic Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Geri
            </button>
            <div className="category-tag">
              {topic.category.name}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {topic.title}
          </h1>
          
          <div className="topic-meta">
            <span>👤 {topic.author.username}</span>
            <span>📅 {formatDate(topic.createdAt)}</span>
            <span>👁️ {topic.views} görüntüleme</span>
            <span>❤️ {topic.likes} beğeni</span>
          </div>
        </div>

        {/* Topic Content */}
        <div className="bg-gray-900/50 border border-white/10 rounded-none p-6 mb-8">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {topic.content}
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">
            Yanıtlar ({replies.length})
          </h2>
          
          {replies.length === 0 ? (
            <div className="text-gray-400 text-center py-6">
              Henüz yanıt yok. İlk yanıtı sen yaz!
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-900/30 border border-white/5 rounded-none p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-400">
                      👤 {reply.author.username}
                    </span>
                    <span className="text-sm text-gray-400">
                      📅 {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {user ? (
          <div className="bg-gray-900/50 border border-white/10 rounded-none p-6">
            <h3 className="text-white font-medium mb-4">Yanıt Yaz</h3>
            <form onSubmit={handleReplySubmit}>
              <div className="form-group">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="form-textarea"
                  placeholder="Yanıtınızı yazın..."
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={replyLoading || !newReply.trim()}
                className="btn btn-register"
              >
                {replyLoading ? 'Gönderiliyor...' : 'Yanıt Gönder'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-white/10 rounded-none p-6 text-center">
            <p className="text-gray-400 mb-4">
              Yanıt yazmak için giriş yapmalısınız
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="btn btn-register"
            >
              Giriş Yap
            </button>
          </div>
        )}
      </main>
    </div>
  )
}