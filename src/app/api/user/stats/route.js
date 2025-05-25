import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
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

    const [topics, replies, messages] = await Promise.all([
      prisma.topic.count({
        where: { authorId: decoded.userId }
      }),
      prisma.reply.count({
        where: { authorId: decoded.userId }
      }),
      prisma.message.count({
        where: { senderId: decoded.userId }
      })
    ])

    return NextResponse.json({
      topics,
      replies,
      messages
    })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
