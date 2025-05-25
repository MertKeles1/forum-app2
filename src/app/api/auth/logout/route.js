import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('Logout API hit')
    
    // Response oluştur
    const response = NextResponse.json(
      { message: 'Çıkış başarılı' },
      { status: 200 }
    )

    // Cookie'yi temizle - multiple ways to ensure it's cleared
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
    })

    // Backup cookie clearing
    response.cookies.delete('token')

    console.log('Cookie cleared')
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Çıkış sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
