import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import { Product } from '@/types/product'

async function getCollection(): Promise<Collection<Product>> {
  const db = await getDb()
  return db.collection<Product>('products')
}

export const ProductModel = {
  async findAll(): Promise<Product[]> {
    const col = await getCollection()
    return col.find({ isActive: true }).sort({ order: 1 }).toArray()
  },

  async findAllForAdmin(): Promise<Product[]> {
    const col = await getCollection()
    return col.find({}).sort({ order: 1 }).toArray()
  },

  async findById(id: string): Promise<Product | null> {
    const col = await getCollection()
    const filter: Filter<Product> = { _id: new ObjectId(id) } as any
    return col.findOne(filter)
  },

  async create(data: Omit<Product, '_id'>): Promise<Product> {
    const col = await getCollection()
    const now = new Date()
    const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now } as any)
    return { ...data, _id: result.insertedId.toString(), createdAt: now, updatedAt: now } as Product
  },

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const col = await getCollection()
    const filter: Filter<Product> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: { ...data, updatedAt: new Date() } })
    return col.findOne(filter)
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<Product> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },

  async search(query: string): Promise<Product[]> {
    const col = await getCollection()
    const regex = { $regex: query, $options: 'i' }
    return col.find({
      $or: [
        { productType: regex },
        { brand: regex },
        { model: regex },
        { 'specifications.brief': regex },
      ],
      isActive: true,
    }).sort({ order: 1 }).toArray()
  },
}
