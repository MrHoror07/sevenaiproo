export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL'
  subscriptionPlan?: string
  subscriptionEnds?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Video {
  id: string
  userId: string
  projectId?: string
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  duration: number
  resolution?: string
  format?: string
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DELETED'
  thumbnail?: string
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  thumbnail?: string
  duration?: number
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED'
  settings?: any
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  method: 'QRIS' | 'MOBILE_BANKING' | 'CREDIT_CARD' | 'EWALLET'
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED'
  type: 'SUBSCRIPTION' | 'ONE_TIME' | 'CREDITS'
  plan: string
  duration: string
  transactionId?: string
  paymentUrl?: string
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PAYMENT' | 'SYSTEM'
  read: boolean
  metadata?: any
  createdAt: Date
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
