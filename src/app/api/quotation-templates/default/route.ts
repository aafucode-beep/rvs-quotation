import { NextRequest } from 'next/server'
import { QuotationTemplateModel } from '@/lib/models/QuotationTemplate'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const template = await QuotationTemplateModel.findDefault()
  if (!template) return err('未找到默认模板', 404)

  return ok({ template })
})
