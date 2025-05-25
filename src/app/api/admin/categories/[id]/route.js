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

export async function PATCH(request, { params }) {
  try {
    await checkAdminAuth(request)

    const { id } = params
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Kategori adı zorunludur' }, { status: 400 })
    }

    // Check if another category has the same name
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: name.trim(),
        NOT: { id: parseInt(id) }
      }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Bu kategori adı zaten kullanılıyor' }, { status: 400 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
      include: {
        _count: {
          select: {
            topics: true
          }
        }
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Update category error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await checkAdminAuth(request)

    const { id } = params

    // Delete category and all related topics
    await prisma.$transaction(async (tx) => {
      // Delete replies of topics in this category
      await tx.reply.deleteMany({
        where: {
          topic: {
            categoryId: parseInt(id)
          }
        }
      })

      // Delete topics in this category
      await tx.topic.deleteMany({
        where: { categoryId: parseInt(id) }
      })

      // Delete the category
      await tx.category.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ message: 'Kategori başarıyla silindi' })
  } catch (error) {
    console.error('Delete category error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
