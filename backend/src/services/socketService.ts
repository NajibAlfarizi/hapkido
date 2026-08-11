import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;
const userSocketsMap = new Map<string, Set<string>>(); // userId -> Set of socketIds

export function initSocketIO(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow anonymous or fallback connections
      return next();
    }

    try {
      const secret = process.env.JWT_SECRET || 'hapkido-secret-key-2026';
      const decoded: any = jwt.verify(String(token), secret);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;

    if (userId) {
      if (!userSocketsMap.has(userId)) {
        userSocketsMap.set(userId, new Set());
      }
      userSocketsMap.get(userId)!.add(socket.id);
    }

    socket.on('register_user', (regUserId: string) => {
      if (regUserId) {
        socket.data.userId = regUserId;
        if (!userSocketsMap.has(regUserId)) {
          userSocketsMap.set(regUserId, new Set());
        }
        userSocketsMap.get(regUserId)!.add(socket.id);
      }
    });

    socket.on('disconnect', () => {
      const uid = socket.data.user?.id || socket.data.userId;
      if (uid && userSocketsMap.has(uid)) {
        userSocketsMap.get(uid)!.delete(socket.id);
        if (userSocketsMap.get(uid)!.size === 0) {
          userSocketsMap.delete(uid);
        }
      }
    });
  });

  console.log('⚡ Socket.io Real-Time Server initialized');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Push real-time notification to a specific user ID
export function sendSocketNotificationToUser(userId: string, notificationData: any) {
  if (!io) return;
  const socketIds = userSocketsMap.get(userId);
  if (socketIds && socketIds.size > 0) {
    socketIds.forEach((sId) => {
      io?.to(sId).emit('notification', notificationData);
    });
  }
}

// Broadcast real-time notification to all connected clients
export function broadcastSocketNotification(notificationData: any) {
  if (!io) return;
  io.emit('notification', notificationData);
}
