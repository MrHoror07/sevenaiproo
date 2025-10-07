import { Server } from 'socket.io'

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Handle video processing updates
    socket.on('video-processing', (data) => {
      socket.to(`user-${data.userId}`).emit('processing-update', data)
    })

    // Handle notifications
    socket.on('send-notification', (data) => {
      socket.to(`user-${data.userId}`).emit('notification', data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}
