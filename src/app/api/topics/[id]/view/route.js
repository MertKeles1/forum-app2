import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// In-memory store to track recent views (simple rate limiting)
const recentViews = new Map()

export async function POST(request, { params }) {
  try {
    const { id } = params
    const topicId = parseInt(id)
    
    // Get client IP for basic duplicate detection
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    const viewKey = `${topicId}-${ip}`
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5 dakika
    
    // Check if this IP viewed this topic in the last 5 minutes
    if (recentViews.has(viewKey)) {
      const lastView = recentViews.get(viewKey)
      if (now - lastView < fiveMinutes) {
        // Too recent, don't increment
        return NextResponse.json({ success: true, message: 'View already counted recently' })
      }
    }
    
    // Record this view
    recentViews.set(viewKey, now)
    
    // Clean up old entries (older than 10 minutes)
    const tenMinutes = 10 * 60 * 1000
    for (const [key, timestamp] of recentViews.entries()) {
      if (now - timestamp > tenMinutes) {
        recentViews.delete(key)
      }
    }
    
    // Increment view count in database
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    console.log(`View count incremented for topic ${topicId} from IP ${ip}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View increment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
