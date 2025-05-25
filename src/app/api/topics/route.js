import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
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
        replies: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Topics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    console.log('=== Topic Creation Started ===')
    
    // Get request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, content, categoryId } = body

    // Validate input
    if (!title || !content || !categoryId) {
      console.log('Missing fields:', { title: !!title, content: !!content, categoryId: !!categoryId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get token from cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader ? 'exists' : 'missing')
    
    if (!cookieHeader) {
      console.log('No cookie header found')
      return NextResponse.json({ error: 'Unauthorized - no cookies' }, { status: 401 })
    }
    
    // Extract token
    const tokenMatch = cookieHeader.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    
    console.log('Token extracted:', token ? 'found' : 'not found')
    
    if (!token) {
      console.log('No token in cookies')
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.log('JWT_SECRET not found')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    let decoded
    try {
      decoded = jwt.verify(token, secret)
      console.log('Token decoded, userId:', decoded.userId)
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Create topic
    console.log('Creating topic with:', { title, content, categoryId: parseInt(categoryId), authorId: decoded.userId })
    
    const topic = await prisma.topic.create({
      data: {
        title,
        content,
        authorId: decoded.userId,
        categoryId: parseInt(categoryId)
      },
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
        }
      }
    })

    console.log('Topic created successfully:', topic.id)
    return NextResponse.json(topic, { status: 201 })

  } catch (error) {
    console.error('Topic creation error:', error)
    return NextResponse.json({ 
      error: 'Topic creation failed',
      details: error.message 
    }, { status: 500 })
  }
}
