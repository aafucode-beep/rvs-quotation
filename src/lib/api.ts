import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Standard API response
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

// Get authenticated user from middleware-injected headers
export function getUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as 'admin' | 'dealer' | 'user' | null
  const username = request.headers.get('x-user-name')

  if (!userId || !role) return null
  return { userId, role, username }
}

// Require admin role
export function requireAdmin(request: NextRequest) {
  const user = getUser(request)
  if (!user) return { user: null, error: err('未授权访问', 401) }
  if (user.role !== 'admin') return { user: null, error: err('权限不足', 403) }
  return { user, error: null }
}

// Wrap async route handler with error boundary — supports optional params arg
export function withErrorHandler<T extends NextRequest>(
  handler: (req: T, ctx?: any) => Promise<NextResponse>
) {
  return async (req: T, ctx?: any): Promise<NextResponse> => {
    try {
      return await handler(req, ctx)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return err(`数据校验失败: ${error.errors.map(e => e.message).join(', ')}`, 422)
      }
      console.error('[API Error]', error)
      return err('服务器内部错误', 500)
    }
  }
}

// Parse and validate request body
export async function parseBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}
