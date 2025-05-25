import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    console.log('Debug endpoint hit')
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
    console.log('All cookies:', request.cookies.getAll())
    
    return NextResponse.json({
      hasJwtSecret: !!process.env.JWT_SECRET,
      cookies: request.cookies.getAll()
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
