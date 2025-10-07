import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

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

    const { videoId, instructions } = await request.json()

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

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Generate AI editing suggestions
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional video editor AI. Provide editing suggestions based on user instructions.'
        },
        {
          role: 'user',
          content: `Video: ${video.originalName}. Instructions: ${instructions || 'Auto-enhance this video'}`
        }
      ]
    })

    const suggestions = completion.choices[0]?.message?.content || 'No suggestions available'

    // Update video status
    await db.video.update({
      where: { id: videoId },
      data: {
        status: 'PROCESSING'
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'EDIT_VIDEO',
        resource: 'video',
        resourceId: videoId,
        metadata: {
          aiSuggestions: suggestions,
          instructions
        }
      }
    })

    // Simulate processing completion
    setTimeout(async () => {
      await db.video.update({
        where: { id: videoId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date()
        }
      })
    }, 5000)

    return NextResponse.json({
      message: 'AI processing started',
      suggestions,
      videoId
    })

  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
