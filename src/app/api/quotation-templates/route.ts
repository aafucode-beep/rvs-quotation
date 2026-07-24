import { NextRequest } from 'next/server'
import { QuotationTemplateModel } from '@/lib/models/QuotationTemplate'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const templates = await QuotationTemplateModel.findAll()
  return ok({ templates })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const data = await request.json()
  const template = await QuotationTemplateModel.create({
    ...data,
    userId: user.userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return ok({ message: '模板创建成功', template }, 201)
})
