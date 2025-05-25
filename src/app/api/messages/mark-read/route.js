import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { senderId } = await request.json()

    // Get token from cookies
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const tokenMatch = cookieHeader.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Mark all messages from senderId to current user as read
    await prisma.message.updateMany({
      where: {
        senderId: parseInt(senderId),
        receiverId: decoded.userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    console.log(`Marked messages as read from user ${senderId} to user ${decoded.userId}`)

    return NextResponse.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
