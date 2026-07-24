import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'

export interface ProjectListSaveDoc {
  _id?: string | ObjectId
  userId: string
  name: string
  items: Array<{
    productId: string
    quantity: number
    selectedVariables?: Record<string, string>
    generatedModel?: string
    unitPrice?: number
    priceType?: 'factory' | 'market'
  }>
  customerInfo: {
    name: string
    contact: string
    phone: string
    email: string
    projectName: string
  }
  quotationNotes?: string
  finalAmount?: number
  projectList?: any[] // back-compat with old saves
  createdAt: Date
  updatedAt: Date
}

async function getCollection(): Promise<Collection<ProjectListSaveDoc>> {
  const db = await getDb()
  return db.collection<ProjectListSaveDoc>('projectListSaves')
}

export const ProjectListSaveModel = {
  async findByUserId(userId: string): Promise<ProjectListSaveDoc[]> {
    const col = await getCollection()
    return col.find({ userId }).sort({ updatedAt: -1 }).toArray()
  },

  async findById(id: string): Promise<ProjectListSaveDoc | null> {
    const col = await getCollection()
    const filter: Filter<ProjectListSaveDoc> = { _id: new ObjectId(id) } as any
    return col.findOne(filter)
  },

  async create(data: Omit<ProjectListSaveDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProjectListSaveDoc> {
    const col = await getCollection()
    const now = new Date()
    const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now })
    return { ...data, _id: result.insertedId, createdAt: now, updatedAt: now }
  },

  async update(id: string, data: Partial<ProjectListSaveDoc>): Promise<ProjectListSaveDoc | null> {
    const col = await getCollection()
    const filter: Filter<ProjectListSaveDoc> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: { ...data, updatedAt: new Date() } })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<ProjectListSaveDoc> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },
}
