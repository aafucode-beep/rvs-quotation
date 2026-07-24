import { NextRequest } from 'next/server'
import { ProductModel } from '@/lib/models/Product'
import { ColumnConfigModel } from '@/lib/models/ColumnConfig'
import { getVisibleColumns, filterProductData } from '@/lib/permissions'
import { ok, err, withErrorHandler, parseBody, getUser, requireAdmin } from '@/lib/api'
import { productSchema } from '@/lib/validations'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const products = await ProductModel.findAll()
  const allColumns = await ColumnConfigModel.findAll()
  const visibleColumns = getVisibleColumns(user.role, allColumns)

  const filteredProducts = products.map(p =>
    filterProductData(user.role, p, visibleColumns)
  )

  return ok({ products: filteredProducts, columns: visibleColumns })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const data = await parseBody(request, productSchema)
  const product = await ProductModel.create(data)
  return ok({ message: '产品创建成功', product }, 201)
})
