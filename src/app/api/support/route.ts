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

    const { subject, message, category } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Create support ticket notification
    const notification = await db.notification.create({
      data: {
        userId: user.id,
        title: `Support Ticket: ${subject}`,
        message: `Category: ${category || 'General'}\n\n${message}`,
        type: 'INFO',
        metadata: {
          type: 'support_ticket',
          subject,
          category,
          status: 'open'
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'SUPPORT_REQUEST',
        metadata: {
          subject,
          category
        }
      }
    })

    return NextResponse.json({
      message: 'Support ticket created',
      ticketId: notification.id,
      status: 'open'
    })

  } catch (error) {
    console.error('Support ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
