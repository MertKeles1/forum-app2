'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  // Kullanıcı değiştiğinde mesajları okundu olarak işaretle
  useEffect(() => {
    if (selectedUser && currentUser) {
      const conversation = getConversation(selectedUser.id)
      const unreadMessages = conversation.filter(msg => 
        msg.receiverId === currentUser.id && !msg.isRead
      )
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(selectedUser.id)
      }
    }
  }, [selectedUser, currentUser])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
        fetchUsers()
        fetchMessages()
      } else {
        router.push('/auth/login?message=Mesajlara erişmek için giriş yapmalısınız')
      }
    } catch (error) {
      router.push('/auth/login?message=Mesajlara erişmek için giriş yapmalısınız')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users')
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (userId) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId: userId })
      })
      // Mesajları yeniden yükle
      fetchMessages()
    } catch (error) {
      console.error('Failed to mark messages as read')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUser.id
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages() // Refresh messages
      } else {
        alert('Mesaj gönderilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setSending(false)
    }
  }

  const getConversation = (userId) => {
    return messages.filter(msg => 
      (msg.senderId === currentUser?.id && msg.receiverId === userId) ||
      (msg.senderId === userId && msg.receiverId === currentUser?.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
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
        <h1 className="page-title mb-8">Mesajlar</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List - Modern Design */}
          <div className="admin-card">
            <h2 className="text-f1f5f9 font-semibold mb-6 pb-3 border-b border-gray-400">
              💬 Kullanıcılar
            </h2>
            <div className="space-y-3">
              {users
                .filter(user => user.id !== currentUser?.id)
                .map((user) => {
                  const conversation = getConversation(user.id)
                  const lastMessage = conversation[conversation.length - 1]
                  const unreadCount = conversation.filter(msg => 
                    msg.receiverId === currentUser?.id && !msg.isRead
                  ).length

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user)
                        // Kullanıcı seçildiğinde mesajları okundu olarak işaretle
                        if (unreadCount > 0) {
                          markMessagesAsRead(user.id)
                        }
                      }}
                      className={`p-4 border border-gray-400 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        selectedUser?.id === user.id 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400 shadow-lg' 
                          : 'hover:bg-gray-800/50 hover:border-gray-300'
                      }`}
                    >
                      {selectedUser?.id === user.id && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-f1f5f9 font-medium">
                            {user.username}
                          </div>
                          {lastMessage && (
                            <div className="text-gray-400 text-sm truncate mt-1">
                              {lastMessage.content.slice(0, 30)}...
                            </div>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Message Area - Modern Chat Design */}
          <div className="lg:col-span-2 admin-card flex flex-col h-96">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-400 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-f1f5f9 font-semibold text-lg">
                        {selectedUser.username}
                      </h3>
                      <p className="text-gray-400 text-sm">ile konuşma</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2 py-2">
                  {getConversation(selectedUser.id).length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">💭</div>
                        <p>Henüz mesaj yok</p>
                        <p className="text-sm">İlk mesajı gönderin!</p>
                      </div>
                    </div>
                  ) : (
                    getConversation(selectedUser.id).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUser?.id 
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-xs lg:max-w-sm ${
                          message.senderId === currentUser?.id 
                            ? 'ml-12' 
                            : 'mr-12'
                        }`}>
                          {/* Message Header with Username */}
                          <div className={`text-xs text-gray-400 mb-1 ${
                            message.senderId === currentUser?.id 
                              ? 'text-right' 
                              : 'text-left'
                          }`}>
                            {message.senderId === currentUser?.id 
                              ? 'Sen' 
                              : selectedUser.username
                            }
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                            message.senderId === currentUser?.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                              : 'bg-gray-800/60 backdrop-filter backdrop-blur-sm text-gray-200 border border-gray-600 rounded-bl-md'
                          }`}>
                            <div className="text-sm leading-relaxed break-words">
                              {message.content}
                            </div>
                          </div>
                          
                          {/* Message Time */}
                          <div className={`text-xs text-gray-500 mt-1 ${
                            message.senderId === currentUser?.id 
                              ? 'text-right' 
                              : 'text-left'
                          }`}>
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Message Form */}
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="form-input resize-none w-full"
                      placeholder="Mesajınızı yazın..."
                      disabled={sending}
                      rows="2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="btn-register px-4 py-2 text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          Gönder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-4xl">💬</div>
                  </div>
                  <h3 className="text-f1f5f9 text-xl font-semibold mb-2">
                    Mesajlaşmaya Başla
                  </h3>
                  <p className="text-gray-400 max-w-xs">
                    Sol taraftan bir kullanıcı seçerek konuşmaya başlayabilirsiniz
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}