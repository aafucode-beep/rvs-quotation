import { ObjectId, Collection, Filter } from 'mongodb'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export interface UserDoc {
  _id?: string | ObjectId
  username: string
  email: string
  password: string
  role: 'admin' | 'dealer' | 'user'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

async function getCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb()
  return db.collection<UserDoc>('users')
}

export const UserModel = {
  async findByUsername(username: string): Promise<UserDoc | null> {
    const col = await getCollection()
    return col.findOne({ username })
  },

  async findById(id: string): Promise<UserDoc | null> {
    const col = await getCollection()
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as any
    return col.findOne(filter)
  },

  async findAll(): Promise<Omit<UserDoc, 'password'>[]> {
    const col = await getCollection()
    return col.find({}, { projection: { password: 0 } }).toArray()
  },

  async create(data: { username: string; email: string; password: string; role: string }): Promise<UserDoc> {
    const col = await getCollection()
    const hashed = await bcrypt.hash(data.password, 10)
    const now = new Date()
    const doc = {
      username: data.username,
      email: data.email,
      password: hashed,
      role: data.role as 'admin' | 'dealer' | 'user',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    const result = await col.insertOne(doc as any)
    return { ...doc, _id: result.insertedId }
  },

  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  },

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const col = await getCollection()
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as any
    const hashed = await bcrypt.hash(newPassword, 10)
    await col.updateOne(filter, { $set: { password: hashed, updatedAt: new Date() } })
  },

  async updateRole(id: string, role: string): Promise<void> {
    const col = await getCollection()
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as any
    await col.updateOne(filter, { $set: { role: role as any, updatedAt: new Date() } })
  },

  async toggleActive(id: string): Promise<void> {
    const col = await getCollection()
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as any
    const user = await col.findOne(filter)
    if (user) {
      await col.updateOne(filter, { $set: { isActive: !user.isActive, updatedAt: new Date() } })
    }
  },

  async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const filter: Filter<UserDoc> = { _id: new ObjectId(id) } as any
    const result = await col.deleteOne(filter)
    return result.deletedCount > 0
  },
}
