import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import { VariableConfig, VariableType } from '@/types/product'

async function getCollection(): Promise<Collection<VariableConfig>> {
  const db = await getDb()
  return db.collection<VariableConfig>('variableConfigs')
}

export const VariableConfigModel = {
  async findAll(): Promise<VariableConfig[]> {
    const col = await getCollection()
    return col.find({ isActive: true }).sort({ order: 1 }).toArray()
  },

  async findByType(type: VariableType): Promise<VariableConfig | null> {
    const col = await getCollection()
    return col.findOne({ type, isActive: true })
  },

  async create(data: Omit<VariableConfig, '_id'>): Promise<VariableConfig> {
    const col = await getCollection()
    const now = new Date()
    const doc = { ...data, allowMultiple: false, createdAt: now, updatedAt: now }
    const result = await col.insertOne(doc as any)
    return { ...doc, _id: result.insertedId.toString() }
  },

  async update(id: string, data: Partial<VariableConfig>): Promise<VariableConfig | null> {
    const col = await getCollection()
    const filter: Filter<VariableConfig> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: { ...data, updatedAt: new Date() } })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<VariableConfig> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },
}
