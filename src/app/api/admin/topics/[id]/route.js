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

export async function DELETE(request, { params }) {
  try {
    await checkAdminAuth(request)

    const { id } = params

    // Delete topic and all related replies
    await prisma.$transaction(async (tx) => {
      // Delete replies first
      await tx.reply.deleteMany({
        where: { topicId: parseInt(id) }
      })

      // Delete the topic
      await tx.topic.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ message: 'Konu ve tüm yanıtları başarıyla silindi' })
  } catch (error) {
    console.error('Delete topic error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
