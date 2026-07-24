import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function calculateMarketPrice(unitPrice: number): number {
  return Math.round((unitPrice / 0.4) * 100) / 100
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  return new Promise((resolve, reject) => {
    if (document.execCommand('copy')) resolve()
    else reject(new Error('复制失败'))
    document.body.removeChild(textArea)
  })
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}

export function shouldShowPrice(controlMethod?: string): boolean {
  if (!controlMethod) return false
  const normalized = controlMethod.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalized === 'onoff' || controlMethod === '不需要' || controlMethod === 'N' || controlMethod === 'n'
}

export function getPriceDisplay(price: number, controlMethod?: string, showFactoryPrice = true): string {
  if (!shouldShowPrice(controlMethod)) {
    return '调光产品价格请咨询销售人员'
  }
  if (!price || price <= 0) return '价格待定'
  const displayPrice = showFactoryPrice ? price : price / 0.4
  return `￥${displayPrice.toFixed(2)}`
}
