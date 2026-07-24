import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import { ColumnConfig } from '@/types/product'

async function getCollection(): Promise<Collection<ColumnConfig>> {
  const db = await getDb()
  return db.collection<ColumnConfig>('columnConfigs')
}

export const ColumnConfigModel = {
  async findAll(): Promise<ColumnConfig[]> {
    const col = await getCollection()
    return col.find({}).sort({ order: 1 }).toArray()
  },

  async findVisible(): Promise<ColumnConfig[]> {
    const col = await getCollection()
    return col.find({ isVisible: true }).sort({ order: 1 }).toArray()
  },

  async create(data: Omit<ColumnConfig, '_id'>): Promise<ColumnConfig> {
    const col = await getCollection()
    const result = await col.insertOne(data as any)
    return { ...data, _id: result.insertedId.toString() }
  },

  async update(id: string, data: Partial<ColumnConfig>): Promise<ColumnConfig | null> {
    const col = await getCollection()
    const filter: Filter<ColumnConfig> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: data })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<ColumnConfig> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },

  async resetToDefault(defaults: ColumnConfig[]): Promise<void> {
    const col = await getCollection()
    await col.deleteMany({})
    await col.insertMany(defaults as any[])
  },
}
