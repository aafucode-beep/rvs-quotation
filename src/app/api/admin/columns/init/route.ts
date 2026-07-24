import { NextRequest } from 'next/server'
import { ColumnConfigModel } from '@/lib/models/ColumnConfig'
import { PRODUCT_COLUMN_CONFIG } from '@/types/product'
import { ok, withErrorHandler, requireAdmin } from '@/lib/api'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  const existing = await ColumnConfigModel.findAll()
  if (existing.length === 0) {
    await ColumnConfigModel.resetToDefault(PRODUCT_COLUMN_CONFIG)
    return ok({ message: '初始化完成', count: PRODUCT_COLUMN_CONFIG.length })
  }

  return ok({ message: '列配置已存在，跳过初始化', count: existing.length })
})
