export type UserRole = 'user' | 'dealer' | 'admin'

export interface User {
  _id?: string
  id?: string
  username: string
  email: string
  password?: string
  role: UserRole
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface JWTPayload {
  userId: string
  username: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}
