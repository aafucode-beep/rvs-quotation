import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/Product'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return ok({ products: [] })
  }

  const products = await ProductModel.search(query)
  return ok({ products })
})
