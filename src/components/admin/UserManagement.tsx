'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { User, UserRole } from '@/types/auth'
import { formatDate } from '@/lib/utils'
import { Loader2, Shield, Mail, Trash2, Users, RefreshCw, UserPlus, Home } from 'lucide-react'
import { ResetPasswordModal } from './ResetPasswordModal'
import CreateUserModal from './CreateUserModal'

export function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set())
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('获取用户列表失败')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error: any) {
      setError(error.message || '加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUsers(prev => new Set(prev).add(userId))

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新失败')
      }

      // 更新本地状态
      setUsers(prev => prev.map(user =>
        user._id === userId || user.id === userId
          ? { ...user, role: newRole }
          : user
      ))

    } catch (error: any) {
      alert(error.message || '更新用户角色失败')
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      setDeletingUsers(prev => new Set(prev).add(userId))

      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '删除失败')
      }

      // 从本地状态中移除用户
      setUsers(prev => prev.filter(user =>
        user._id !== userId && user.id !== userId
      ))

    } catch (error: any) {
      alert(error.message || '删除用户失败')
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      dealer: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800'
    }

    const labels = {
      admin: '管理员',
      dealer: '经销商',
      user: '用户'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  用户管理
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 hidden sm:block">
                  管理系统用户账户和权限设置
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-600">
                  总用户数: <span className="font-semibold text-blue-600">{users.length}</span>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => router.push('/product-list-v3')}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">返回首页</span>
                    <span className="sm:hidden">首页</span>
                  </Button>
                  <Button
                    onClick={() => setShowCreateUser(true)}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                  >
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">新建用户</span>
                    <span className="sm:hidden">新建</span>
                  </Button>
                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    刷新
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* 统计信息卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">管理员</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">经销商</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-900">
                    {users.filter(u => u.role === 'dealer').length}
                  </p>
                </div>
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-600">普通用户</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-900">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* 移动端提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 sm:hidden print:hidden">
            <div className="text-blue-800 text-xs">
              💡 提示：表格可左右滑动查看更多信息，建议横屏使用
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">用户名</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">邮箱</TableHead>
                    <TableHead className="text-xs sm:text-sm">角色</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">注册时间</TableHead>
                    <TableHead className="text-xs sm:text-sm">操作</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const userId = user._id || user.id!
                  const isUpdating = updatingUsers.has(userId)
                  const isDeleting = deletingUsers.has(userId)

                  return (
                    <TableRow key={userId}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div>
                          <div>{user.username}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{formatDate(user.createdAt || new Date())}</TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(userId, e.target.value as UserRole)}
                            disabled={isUpdating || isDeleting}
                            className="text-xs sm:text-sm border border-gray-300 rounded px-1 sm:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                            title="选择用户角色"
                          >
                            <option value="user">用户</option>
                            <option value="dealer">经销商</option>
                            <option value="admin">管理员</option>
                          </select>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setResetPasswordUser(user)}
                              disabled={isUpdating || isDeleting}
                              className="text-xs px-2 py-1"
                              title="重置用户密码"
                            >
                              <Shield className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">重置密码</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUser(userId, user.username)}
                              disabled={isUpdating || isDeleting}
                              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1"
                              title="删除用户"
                            >
                              <Trash2 className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">删除</span>
                            </Button>
                            {(isUpdating || isDeleting) && (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            共 {users.length} 个用户
          </div>

          {/* 重置密码弹窗 */}
          <ResetPasswordModal
            isOpen={!!resetPasswordUser}
            onClose={() => setResetPasswordUser(null)}
            user={resetPasswordUser}
            onSuccess={fetchUsers}
          />

          {/* 新建用户弹窗 */}
          <CreateUserModal
            isOpen={showCreateUser}
            onClose={() => setShowCreateUser(false)}
            onSuccess={fetchUsers}
          />
        </div>
      </div>
    </div>
  )
}