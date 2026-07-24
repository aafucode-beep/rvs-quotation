import { NextRequest } from 'next/server'
import { ModelGenerationRuleModel } from '@/lib/models/ModelGenerationRule'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const rule = await ModelGenerationRuleModel.findAll().then(rules => rules.find(r => (r._id as any)?.toString() === id))
  if (!rule) return err('规则不存在', 404)

  return ok({ rule })
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const data = await request.json()
  const rule = await ModelGenerationRuleModel.update(id, data)
  if (!rule) return err('规则不存在', 404)

  return ok({ message: '更新成功', rule })
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const deleted = await ModelGenerationRuleModel.delete(id)
  if (!deleted) return err('规则不存在', 404)

  return ok({ message: '删除成功' })
})
