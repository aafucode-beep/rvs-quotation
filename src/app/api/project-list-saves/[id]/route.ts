import { NextRequest } from 'next/server'
import { ProjectListSaveModel } from '@/lib/models/ProjectListSave'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { id } = await params
  const save = await ProjectListSaveModel.findById(id)
  if (!save) return err('清单不存在', 404)
  if (save.userId !== user.userId) return err('无权访问', 403)

  return ok({ save })
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { id } = await params
  const existing = await ProjectListSaveModel.findById(id)
  if (!existing) return err('清单不存在', 404)
  if (existing.userId !== user.userId) return err('无权访问', 403)

  const data = await request.json()
  const updated = await ProjectListSaveModel.update(id, data)
  return ok({ message: '更新成功', save: updated })
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { id } = await params
  const existing = await ProjectListSaveModel.findById(id)
  if (!existing) return err('清单不存在', 404)
  if (existing.userId !== user.userId) return err('无权访问', 403)

  await ProjectListSaveModel.delete(id)
  return ok({ message: '删除成功' })
})
