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

    const formData = await request.formData()
    const file = formData.get('video') as File
    const projectId = formData.get('projectId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Create video record
    const video = await db.video.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        originalName: file.name,
        fileName: `${Date.now()}-${file.name}`,
        filePath: `/uploads/${user.id}/${Date.now()}-${file.name}`,
        fileSize: file.size,
        duration: 0, // Will be updated after processing
        status: 'UPLOADING'
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPLOAD_VIDEO',
        resource: 'video',
        resourceId: video.id,
        metadata: {
          fileName: file.name,
          fileSize: file.size
        }
      }
    })

    // Simulate video processing (in real app, you'd process the file)
    setTimeout(async () => {
      await db.video.update({
        where: { id: video.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          duration: Math.floor(Math.random() * 300) + 30 // Random duration 30-330s
        }
      })
    }, 3000)

    return NextResponse.json({
      message: 'Video upload started',
      video: {
        id: video.id,
        originalName: video.originalName,
        status: video.status,
        fileSize: video.fileSize
      }
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
