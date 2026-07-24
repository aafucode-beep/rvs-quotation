import { NextRequest } from 'next/server'
import { ColumnConfigModel } from '@/lib/models/ColumnConfig'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'
import { columnConfigSchema } from '@/lib/validations'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const columns = await ColumnConfigModel.findAll()
  return ok({ columns })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const data = await request.json().then(body => columnConfigSchema.parse(body))
  const column = await ColumnConfigModel.create(data)
  return ok({ message: '列配置创建成功', column }, 201)
})
