import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Get user before deleting session for activity log
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (session) {
      // Log activity
      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'LOGOUT',
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    }

    // Delete session
    await deleteSession(token)

    return NextResponse.json({
      message: 'Logout successful'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
