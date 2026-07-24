import { z } from 'zod'

// 用户角色枚举
export const roleSchema = z.enum(['admin', 'dealer', 'user'])

// 认证
export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50),
  password: z.string().min(6, '密码至少6个字符').max(100),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  role: roleSchema.default('user'),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6, '新密码至少6个字符').max(100),
})

// 产品
export const productSchema = z.object({
  productType: z.string().min(1, '产品类型不能为空'),
  brand: z.string().min(1, '品牌不能为空'),
  model: z.string().min(1, '产品型号不能为空'),
  modelLink: z.string().url().optional().or(z.literal('')),
  images: z.object({
    display: z.string().optional(),
    dimension: z.string().optional(),
    accessories: z.string().optional(),
  }).partial().default({}),
  specifications: z.object({
    detailed: z.string().default(''),
    brief: z.string().default(''),
  }).default({}),
  appearance: z.object({
    color: z.string().default(''),
    installation: z.string().default(''),
    cutoutSize: z.string().optional(),
  }).default({}),
  control: z.string().default(''),
  productremark: z.string().optional(),
  pricing: z.object({
    unitPrice: z.number().min(0).default(0),
    marketPrice: z.number().min(0).optional(),
    deliveryTime: z.string().default(''),
  }).default({}),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  order: z.number().default(999),
})

// 列配置
export const columnConfigSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'image', 'number', 'date', 'multiline', 'singleline', 'variable', 'generated', 'action']),
  roles: z.array(roleSchema).default(['user', 'dealer', 'admin']),
  width: z.string().optional(),
  bg: z.string().optional(),
  order: z.number(),
  isVisible: z.boolean().default(true),
})

// 变量配置
export const variableConfigSchema = z.object({
  type: z.enum(['colorTemperature', 'beamAngle', 'appearanceColor', 'controlMethod']),
  label: z.string().min(1),
  options: z.array(z.object({
    value: z.string().min(1),
    code: z.string().min(1),
    isDefault: z.boolean().optional(),
    order: z.number(),
  })),
  isRequired: z.boolean().default(false),
  order: z.number(),
  isActive: z.boolean().default(true),
})

// 报价模板
export const quotationTemplateSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().default(''),
  companyAddress: z.string().default(''),
  companyPhone: z.string().default(''),
  companyEmail: z.string().email().optional().or(z.literal('')),
  logo: z.string().optional(),
  notes: z.string().default(''),
  isDefault: z.boolean().default(false),
})

// 项目清单保存
export const projectListSaveSchema = z.object({
  name: z.string().min(1, '清单名称不能为空'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1).default(1),
    selectedVariables: z.record(z.string()).optional(),
    generatedModel: z.string().optional(),
    unitPrice: z.number().optional(),
    priceType: z.enum(['factory', 'market']).optional(),
  })),
  customerInfo: z.object({
    name: z.string().default(''),
    contact: z.string().default(''),
    phone: z.string().default(''),
    email: z.string().default(''),
    projectName: z.string().default(''),
  }).default({}),
  quotationNotes: z.string().optional(),
  finalAmount: z.number().optional(),
})
