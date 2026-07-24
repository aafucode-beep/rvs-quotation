'use client'

import { useState, useEffect } from 'react'
import { ProductSelectionTableV3 } from '@/components/dashboard/ProductSelectionTableV3'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, List, Maximize2, Minimize2, Key, LogOut, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal'

export default function ProductListPage() {
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  const roleLabel = user.role === 'admin' ? '管理员' : user.role === 'dealer' ? '经销商' : '用户'
  const roleColor = user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'dealer' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isFullWidth ? 'max-w-full' : 'max-w-7xl'}`}>
          <div className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                RVS Lighting 产品选型表
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-blue-700">{user.username}</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFullWidth(!isFullWidth)}>
                {isFullWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden lg:inline ml-1">{isFullWidth ? '居中' : '全宽'}</span>
              </Button>
              <Link href="/project-list">
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4" />
                  <span className="ml-1">项目清单</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                <Key className="h-4 w-4" />
                <span className="hidden lg:inline ml-1">密码</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/login') }}>
                <LogOut className="h-4 w-4" />
                <span className="ml-1">退出</span>
              </Button>
              {user.role === 'admin' && (
                <>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4" />
                      <span className="ml-1">用户管理</span>
                    </Button>
                  </Link>
                  <Link href="/admin/products-v2" target="_blank">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      <span className="ml-1">产品管理</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isFullWidth ? 'max-w-full' : 'max-w-7xl'}`}>
        <ProductSelectionTableV3 userRole={user.role} />
      </main>

      <div className="h-16" />

      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  )
}
