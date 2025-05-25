import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

async function checkAdminAuth(request) {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    throw new Error('Unauthorized')
  }
  
  const tokenMatch = cookieHeader.match(/token=([^;]+)/)
  const token = tokenMatch ? tokenMatch[1] : null
  
  if (!token) {
    throw new Error('Unauthorized')
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { role: true }
  })
  
  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  
  return decoded
}

export async function GET(request) {
  try {
    await checkAdminAuth(request)

    const topics = await prisma.topic.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Admin topics list error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
