import { NextRequest } from 'next/server'
import { ProjectListSaveModel } from '@/lib/models/ProjectListSave'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'
import { projectListSaveSchema } from '@/lib/validations'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const saves = await ProjectListSaveModel.findByUserId(user.userId)
  return ok({ saves })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const data = await request.json().then(body => projectListSaveSchema.parse(body))
  const save = await ProjectListSaveModel.create({
    ...data,
    userId: user.userId,
  })

  return ok({ message: '保存成功', save }, 201)
})
