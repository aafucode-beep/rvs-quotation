import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { ok, err, withErrorHandler, parseBody, getUser } from '@/lib/api'
import { changePasswordSchema } from '@/lib/validations'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { oldPassword, newPassword } = await parseBody(request, changePasswordSchema)

  const dbUser = await UserModel.findById(user.userId)
  if (!dbUser) return err('用户不存在', 404)

  const valid = await UserModel.verifyPassword(oldPassword, dbUser.password)
  if (!valid) return err('原密码错误', 401)

  await UserModel.updatePassword(user.userId, newPassword)
  return ok({ message: '密码修改成功' })
})
