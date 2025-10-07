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

    const { paymentId, transactionId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get payment
    const payment = await db.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Simulate payment verification (in real app, you'd verify with payment provider)
    const isVerified = Math.random() > 0.1 // 90% success rate for demo

    if (isVerified) {
      // Update payment status
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date()
        }
      })

      // Update user subscription
      const subscriptionEnds = new Date()
      subscriptionEnds.setMonth(
        subscriptionEnds.getMonth() + (payment.duration === 'yearly' ? 12 : 1)
      )

      await db.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: payment.plan,
          subscriptionEnds
        }
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'PAYMENT_SUCCESS',
          resource: 'payment',
          resourceId: paymentId,
          metadata: {
            plan: payment.plan,
            amount: payment.amount
          }
        }
      })

      return NextResponse.json({
        message: 'Payment verified successfully',
        status: 'SUCCESS',
        subscriptionEnds
      })
    } else {
      // Update payment status
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED'
        }
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'PAYMENT_FAILED',
          resource: 'payment',
          resourceId: paymentId,
          metadata: {
            plan: payment.plan,
            amount: payment.amount
          }
        }
      })

      return NextResponse.json({
        message: 'Payment verification failed',
        status: 'FAILED'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
