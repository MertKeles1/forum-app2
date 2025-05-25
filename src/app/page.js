'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics')
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Az önce'
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays === 1) return '1 gün önce'
    return `${diffDays} gün önce`
  }

  return (
    <div className="container">
      <Header />
      
      <main className="main-content">
        <div className="content-header">
          <h1 className="page-title">Son Konular</h1>
          <Link href="/topics/new" className="btn-new-topic">
            + Yeni Konu Aç
          </Link>
        </div>

        {loading ? (
          <div className="text-white text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="space-y-1">
            {topics.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                Henüz konu oluşturulmamış. İlk konuyu sen oluştur!
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="topic-item">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Link href={`/topics/${topic.id}`} className="block">
                        <div className="topic-title hover:text-gray-300 transition-colors">
                          {topic.title}
                        </div>
                      </Link>
                      <div className="topic-meta">
                        <span>👤 {topic.author.username}</span>
                        <span>📅 {formatDate(topic.createdAt)}</span>
                      </div>
                    </div>
                    <div className="category-tag">
                      {topic.category.name}
                    </div>
                  </div>
                  
                  <div className="topic-preview">
                    {topic.content.length > 150 
                      ? topic.content.substring(0, 150) + '...'
                      : topic.content
                    }
                  </div>
                  
                  <div className="topic-stats">
                    <div className="flex items-center gap-1">
                      💬 {topic.replies.length} yanıt
                    </div>
                    <div className="flex items-center gap-1">
                      👁️ {topic.views} görüntüleme
                    </div>
                    <div className="flex items-center gap-1">
                      ❤️ {topic.likes} beğeni
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}