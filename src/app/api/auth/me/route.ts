import { NextRequest } from 'next/server'
import { ok, getUser } from '@/lib/api'

export const GET = (request: NextRequest) => {
  const user = getUser(request)
  if (!user) {
    return ok({ user: null })
  }
  return ok({ user })
}
