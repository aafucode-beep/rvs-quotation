import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import { ModelGenerationRule } from '@/types/product'

async function getCollection(): Promise<Collection<ModelGenerationRule>> {
  const db = await getDb()
  return db.collection<ModelGenerationRule>('modelGenerationRules')
}

export const ModelGenerationRuleModel = {
  async findAll(): Promise<ModelGenerationRule[]> {
    const col = await getCollection()
    return col.find({ isActive: true }).sort({ order: 1 }).toArray()
  },

  async findDefault(): Promise<ModelGenerationRule | null> {
    const col = await getCollection()
    return col.findOne({ isDefault: true, isActive: true })
  },

  async create(data: Omit<ModelGenerationRule, '_id'>): Promise<ModelGenerationRule> {
    const col = await getCollection()
    const now = new Date()
    const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now } as any)
    return { ...data, _id: result.insertedId.toString(), createdAt: now, updatedAt: now }
  },

  async update(id: string, data: Partial<ModelGenerationRule>): Promise<ModelGenerationRule | null> {
    const col = await getCollection()
    const filter: Filter<ModelGenerationRule> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: { ...data, updatedAt: new Date() } })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<ModelGenerationRule> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },
}
