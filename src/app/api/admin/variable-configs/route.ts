import { NextRequest } from 'next/server'
import { VariableConfigModel } from '@/lib/models/VariableConfig'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const configs = await VariableConfigModel.findAll()
  return ok({ configs })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const data = await request.json()
  const config = await VariableConfigModel.create({
    ...data,
    allowMultiple: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return ok({ message: '变量配置创建成功', config }, 201)
})
