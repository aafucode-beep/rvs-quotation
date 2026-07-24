import { NextRequest } from 'next/server'
import { ProductModelGenerator } from '@/lib/services/ProductModelGenerator'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  const { baseModel, variables, ruleId } = await request.json()

  if (!baseModel) return err('基础型号不能为空', 400)

  const generatedModel = await ProductModelGenerator.generateModel(baseModel, variables, ruleId)
  return ok({ generatedModel })
})
