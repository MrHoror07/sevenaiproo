import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { plan, duration, method } = await request.json()

    if (!plan || !duration || !method) {
      return NextResponse.json(
        { error: 'Plan, duration, and method are required' },
        { status: 400 }
      )
    }

    // Define pricing
    const pricing = {
      BASIC: { monthly: 0, yearly: 0 },
      PRO: { monthly: 29, yearly: 290 },
      PREMIUM: { monthly: 99, yearly: 990 }
    }

    const amount = pricing[plan as keyof typeof pricing]?.[duration as keyof typeof pricing[typeof plan]] || 0

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'USD',
        method: method as any,
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        plan,
        duration,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentUrl: `https://payment.example.com/pay/${Date.now()}`
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_PENDING',
        resource: 'payment',
        resourceId: payment.id,
        metadata: {
          plan,
          duration,
          amount,
          method
        }
      }
    })

    return NextResponse.json({
      message: 'Payment created',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentUrl: payment.paymentUrl,
        transactionId: payment.transactionId
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
