export interface QuotationTemplate {
  _id?: string
  id?: string
  userId?: string

  name?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  logo?: string
  notes?: string
  isDefault?: boolean

  // 兼容旧结构
  companyInfo?: {
    name: string
    brandName?: string
    logo?: string
    address?: string
    phone?: string
    email?: string
    contactPerson?: string
  }

  quotationNotes?: string

  createdAt?: Date | string
  updatedAt?: Date | string
}
