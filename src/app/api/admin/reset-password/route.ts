import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(6).max(100),
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { userId, newPassword } = await request.json().then(body => schema.parse(body))
  await UserModel.updatePassword(userId, newPassword)
  return ok({ message: '密码重置成功' })
})
