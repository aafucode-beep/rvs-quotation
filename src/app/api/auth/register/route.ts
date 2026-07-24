import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { ok, err, withErrorHandler } from '@/lib/api'
import { registerSchema } from '@/lib/validations'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const data = await request.json().then(body => registerSchema.parse(body))

  const existing = await UserModel.findByUsername(data.username)
  if (existing) return err('用户名已存在', 409)

  const user = await UserModel.create({
    username: data.username,
    email: data.email || '',
    password: data.password,
    role: data.role,
  })

  return ok({
    message: '注册成功',
    user: {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }, 201)
})
