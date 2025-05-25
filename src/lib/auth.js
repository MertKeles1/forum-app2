import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export function createToken(userId, role) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET is not defined')
      return null
    }
    
    return jwt.verify(token, secret)
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    
    console.log('Token from cookie:', token ? 'exists' : 'not found')

    if (!token) {
      console.log('No token found')
      return null
    }

    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded ? 'valid' : 'invalid')
    
    return decoded
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}