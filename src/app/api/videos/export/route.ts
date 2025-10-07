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

    const { videoId, format, quality } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Get video
    const video = await db.video.findFirst({
      where: {
        id: videoId,
        userId: user.id
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'EXPORT_VIDEO',
        resource: 'video',
        resourceId: videoId,
        metadata: {
          format: format || 'mp4',
          quality: quality || '1080p'
        }
      }
    })

    // Simulate export processing
    const exportUrl = `/exports/${user.id}/${videoId}-${Date.now()}.${format || 'mp4'}`

    return NextResponse.json({
      message: 'Export started',
      exportUrl,
      estimatedTime: '2-5 minutes'
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
