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

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            topics: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Admin categories list error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await checkAdminAuth(request)

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Kategori adı zorunludur' }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Bu kategori zaten mevcut' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: {
            topics: true
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
