import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const replies = await prisma.reply.findMany({
      where: { topicId: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Replies fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

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

    const reply = await prisma.reply.create({
      data: {
        content: content.trim(),
        authorId: decoded.userId,
        topicId: parseInt(id)
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Reply creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
