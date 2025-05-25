import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Categories API hit')
    
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log('Categories found:', categories.length)
    return NextResponse.json(categories)
    
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
