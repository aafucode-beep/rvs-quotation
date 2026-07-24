import { NextRequest } from 'next/server'
import { ModelGenerationRuleModel } from '@/lib/models/ModelGenerationRule'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const rules = await ModelGenerationRuleModel.findAll()
  return ok({ rules })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const data = await request.json()
  const rule = await ModelGenerationRuleModel.create(data)
  return ok({ message: '规则创建成功', rule }, 201)
})
