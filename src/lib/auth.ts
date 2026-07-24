import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const EXPIRES_IN = '7d'

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}
