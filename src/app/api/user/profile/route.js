import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function PATCH(request) {
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
    const { username, email } = await request.json()

    if (!username || !email) {
      return NextResponse.json({ error: 'Kullanıcı adı ve e-posta zorunludur' }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Kullanıcı adı en az 3 karakter olmalıdır' }, { status: 400 })
    }

    // Check if username or email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: {
          id: decoded.userId
        }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { username, email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({ message: 'Profil başarıyla güncellendi', user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
