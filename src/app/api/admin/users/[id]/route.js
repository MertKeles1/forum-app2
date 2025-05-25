import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    // Check admin auth
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
    
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deletion
    if (decoded.userId === parseInt(id)) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 })
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete user's messages
      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: parseInt(id) },
            { receiverId: parseInt(id) }
          ]
        }
      })

      // Delete user's replies
      await tx.reply.deleteMany({
        where: { authorId: parseInt(id) }
      })

      // Delete user's topics
      await tx.topic.deleteMany({
        where: { authorId: parseInt(id) }
      })

      // Delete the user
      await tx.user.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
