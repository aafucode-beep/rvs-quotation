import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const POST = () => {
  const response = NextResponse.json({ message: '已退出登录' })
  response.cookies.delete('auth-token')
  return response
}
