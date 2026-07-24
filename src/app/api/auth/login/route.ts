import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { generateToken } from '@/lib/auth'
import { ok, err, withErrorHandler, parseBody } from '@/lib/api'
import { loginSchema } from '@/lib/validations'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { username, password } = await parseBody(request, loginSchema)

  const user = await UserModel.findByUsername(username)
  if (!user) {
    return err('用户不存在', 404)
  }

  if (!user.isActive) {
    return err('账户已被禁用', 403)
  }

  const valid = await UserModel.verifyPassword(password, user.password)
  if (!valid) {
    return err('密码错误', 401)
  }

  const token = generateToken({
    userId: (user._id as any).toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  })

  const response = ok({
    message: '登录成功',
    user: {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  })

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
})
