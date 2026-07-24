import { NextRequest } from 'next/server'
import { UserModel } from '@/lib/models/User'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'
import { z } from 'zod'

const createUserSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email().optional().or(z.literal('')),
  role: z.enum(['admin', 'dealer', 'user']).default('user'),
})

const updateUserSchema = z.object({
  role: z.enum(['admin', 'dealer', 'user']).optional(),
  isActive: z.boolean().optional(),
})

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const users = await UserModel.findAll()
  return ok({ users })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const data = await request.json().then(body => createUserSchema.parse(body))

  const existing = await UserModel.findByUsername(data.username)
  if (existing) return err('用户名已存在', 409)

  const newUser = await UserModel.create({
    username: data.username,
    email: data.email || '',
    password: data.password,
    role: data.role,
  })

  return ok({
    message: '用户创建成功',
    user: {
      id: (newUser._id as any).toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  }, 201)
})

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return err('缺少用户 ID', 400)

  const data = await request.json().then(body => updateUserSchema.parse(body))

  if (data.role) await UserModel.updateRole(id, data.role)
  if (data.isActive !== undefined) {
    const target = await UserModel.findById(id)
    if (target && target.isActive !== data.isActive) {
      await UserModel.toggleActive(id)
    }
  }

  return ok({ message: '更新成功' })
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return err('缺少用户 ID', 400)
  if (user!.userId === id) return err('不能删除自己', 400)

  const deleted = await UserModel.delete(id)
  if (!deleted) return err('用户不存在', 404)

  return ok({ message: '删除成功' })
})
