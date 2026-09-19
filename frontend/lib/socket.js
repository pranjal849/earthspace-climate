import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    const url = typeof window !== 'undefined' ? 'http://localhost:8000' : 'http://localhost:8000'
    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
