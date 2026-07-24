import { NextRequest } from 'next/server'
import { ColumnConfigModel } from '@/lib/models/ColumnConfig'
import { PRODUCT_COLUMN_CONFIG } from '@/types/product'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  await ColumnConfigModel.resetToDefault(PRODUCT_COLUMN_CONFIG)
  return ok({ message: '列配置已重置为默认值' })
})
