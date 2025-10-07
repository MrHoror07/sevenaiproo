import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  return db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
      status: 'ACTIVE'
    }
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  
  if (!isValid) {
    return null
  }

  return user
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      subscriptionPlan: true,
      subscriptionEnds: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function createSession(userId: string) {
  const token = generateToken({ 
    userId, 
    email: '', 
    role: '' 
  })
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  return db.session.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })
}

export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return session.user
}

export async function deleteSession(token: string) {
  return db.session.delete({
    where: { token }
  })
}
