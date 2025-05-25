import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    console.log('=== Auth Me Endpoint Hit ===')
    
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader)
    
    if (!cookieHeader) {
      console.log('No cookie header found')
      return NextResponse.json({ error: 'No cookies' }, { status: 401 })
    }
    
    // Extract token from cookie string
    const tokenMatch = cookieHeader.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    
    console.log('Token extracted:', token ? 'found' : 'not found')
    
    if (!token) {
      console.log('No token in cookies')
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.log('JWT_SECRET not found')
      return NextResponse.json({ error: 'JWT_SECRET missing' }, { status: 500 })
    }
    
    let decoded
    try {
      decoded = jwt.verify(token, secret)
      console.log('Token decoded:', decoded)
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    })
    
    if (!user) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('User found:', user.username)
    return NextResponse.json(user)
    
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
