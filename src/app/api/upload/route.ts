import { NextRequest } from 'next/server'
import { ok, err, withErrorHandler, requireAdmin } from '@/lib/api'
import { uploadToCOS, isCOSConfigured } from '@/lib/cos'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { user, error } = requireAdmin(request)
  if (error) return error

  if (!isCOSConfigured()) {
    return err('文件存储未配置', 503)
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return err('未提供文件', 400)

  const result = await uploadToCOS(file)
  return ok({ message: '上传成功', ...result }, 201)
})
