import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/Product'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'
import { productSchema } from '@/lib/validations'
import { z } from 'zod'

const updateSchema = productSchema.partial()

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const product = await ProductModel.findById(id)
  if (!product) return err('产品不存在', 404)

  return ok({ product })
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const data = await request.json().then(body => updateSchema.parse(body))
  const product = await ProductModel.update(id, data)
  if (!product) return err('产品不存在', 404)

  return ok({ message: '更新成功', product })
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const { id } = await params
  const deleted = await ProductModel.delete(id)
  if (!deleted) return err('产品不存在', 404)

  return ok({ message: '删除成功' })
})
