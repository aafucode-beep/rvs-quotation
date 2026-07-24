import { NextRequest } from 'next/server'
import { uploadToCOS, isCOSConfigured } from '@/lib/cos'
import { ok, err, withErrorHandler, getUser } from '@/lib/api'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUser(request)
  if (!user) return err('未授权访问', 401)

  if (!isCOSConfigured()) return err('文件存储未配置', 503)

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const quotationNumber = formData.get('quotationNumber') as string | null

  if (!file) return err('未提供文件', 400)

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  if (!allowedTypes.some(t => file.type.includes(t))) {
    return err('只能上传 PDF 或 Excel 文件', 400)
  }

  if (file.size > 20 * 1024 * 1024) return err('文件大小不能超过 20MB', 400)

  const timestamp = Date.now()
  const ext = file.type.includes('spreadsheetml.sheet') ? '.xlsx'
    : file.type.includes('ms-excel') ? '.xls' : '.pdf'
  const filename = quotationNumber
    ? `${quotationNumber}_${timestamp}${ext}`
    : `quotation_${timestamp}${ext}`

  const result = await uploadToCOS(file, 'quotations', filename)

  return ok({
    message: '报价单上传成功',
    url: result.url,
    fileName: result.filename,
    cosStoragePath: result.cosStoragePath,
    size: result.size,
    type: result.mimeType,
    quotationNumber: quotationNumber || null,
  }, 201)
})
