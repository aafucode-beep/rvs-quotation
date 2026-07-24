import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import { QuotationTemplate } from '@/types/quotation'

async function getCollection(): Promise<Collection<QuotationTemplate>> {
  const db = await getDb()
  return db.collection<QuotationTemplate>('quotationTemplates')
}

export const QuotationTemplateModel = {
  async findAll(): Promise<QuotationTemplate[]> {
    const col = await getCollection()
    return col.find({}).sort({ isDefault: -1, createdAt: 1 }).toArray()
  },

  async findDefault(): Promise<QuotationTemplate | null> {
    const col = await getCollection()
    return col.findOne({ isDefault: true } as any)
  },

  async create(data: Omit<QuotationTemplate, '_id'>): Promise<QuotationTemplate> {
    const col = await getCollection()
    const result = await col.insertOne(data as any)
    return { ...data, _id: result.insertedId.toString() }
  },

  async update(id: string, data: Partial<QuotationTemplate>): Promise<QuotationTemplate | null> {
    const col = await getCollection()
    const filter: Filter<QuotationTemplate> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: data })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<QuotationTemplate> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },
}
