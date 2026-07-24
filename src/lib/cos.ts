import COS from 'cos-nodejs-sdk-v5'

let cosInstance: COS | null = null

function getCos(): COS | null {
  if (!cosInstance) {
    const secretId = process.env.TENCENT_SECRET_ID
    const secretKey = process.env.TENCENT_SECRET_KEY
    if (!secretId || !secretKey) return null
    cosInstance = new COS({ SecretId: secretId, SecretKey: secretKey })
  }
  return cosInstance
}

export interface UploadResult {
  url: string
  cosStoragePath: string
  filename: string
  size: number
  mimeType: string
}

export async function uploadToCOS(
  file: File | Blob,
  folder = 'rvs',
  customFilename?: string
): Promise<UploadResult> {
  const cos = getCos()
  if (!cos) throw new Error('COS 未配置')

  const bucket = process.env.TENCENT_COS_BUCKET!
  const region = process.env.TENCENT_COS_REGION || 'ap-guangzhou'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  let filename: string
  if (customFilename) {
    filename = customFilename
  } else if (file instanceof File) {
    const ext = file.name.split('.').pop()
    filename = `${timestamp}-${random}.${ext}`
  } else {
    filename = `${timestamp}-${random}.pdf`
  }

  const cosStoragePath = `${folder}/${filename}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const mimeType = file instanceof File ? file.type : 'application/pdf'

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: cosStoragePath,
        Body: buffer,
        ContentType: mimeType,
      },
      (err) => (err ? reject(err) : resolve())
    )
  })

  const url = `https://${bucket}.cos.${region}.myqcloud.com/${cosStoragePath}`

  return { url, cosStoragePath, filename, size: file.size, mimeType }
}

export async function deleteFromCOS(cosStoragePath: string): Promise<void> {
  const cos = getCos()
  if (!cos) return

  const bucket = process.env.TENCENT_COS_BUCKET!
  const region = process.env.TENCENT_COS_REGION || 'ap-guangzhou'

  await new Promise<void>((resolve, reject) => {
    cos.deleteObject(
      { Bucket: bucket, Region: region, Key: cosStoragePath },
      (err) => (err ? reject(err) : resolve())
    )
  })
}

export function isCOSConfigured(): boolean {
  return !!(
    process.env.TENCENT_SECRET_ID &&
    process.env.TENCENT_SECRET_KEY &&
    process.env.TENCENT_COS_BUCKET
  )
}
