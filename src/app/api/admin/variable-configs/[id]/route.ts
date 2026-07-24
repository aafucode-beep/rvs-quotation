import { NextRequest } from 'next/server'
import { VariableConfigModel } from '@/lib/models/VariableConfig'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const config = await VariableConfigModel.findByType(id as any)
  if (!config) return err('配置不存在', 404)

  return ok({ config })
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const data = await request.json()
  const config = await VariableConfigModel.update(id, data)
  if (!config) return err('配置不存在', 404)

  return ok({ message: '更新成功', config })
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const deleted = await VariableConfigModel.delete(id)
  if (!deleted) return err('配置不存在', 404)

  return ok({ message: '删除成功' })
})
