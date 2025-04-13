// @ts-nocheck
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../@types/userPayload';

// Store active connections by userId
const activeConnections: Map<string, Set<string>> = new Map();

// Store socket instances by socketId
const socketInstances: Map<string, any> = new Map();
// Initialize WebSocket server
export const initializeWebSocketServer = (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, restrict this to your client domains
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket: any, next: any) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
      if (!decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: any) => {
    console.log(`New client connected: ${socket.id}`);
    const userId = socket.data.user.id;

    // Register connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId)!.add(socket.id);
    socketInstances.set(socket.id, socket);

    // Event handlers
    socket.on('message', (data: any) => handleMessage(socket, data));

    // Join rooms based on user's groups, rides, etc.
    joinUserRooms(socket, userId);

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up connections
      const userConnections = activeConnections.get(userId);
      if (userConnections) {
        userConnections.delete(socket.id);
        if (userConnections.size === 0) {
          activeConnections.delete(userId);
        }
      }
      socketInstances.delete(socket.id);
    });
  });

  return io;
};

// Helper functions
const handleMessage = (socket: any, data: any) => {
  try {
    const { type, payload, target } = data;

    // Handle different message types
    switch (type) {
      case 'direct-message':
        sendToUser(target, {
          type: 'direct-message',
          fromUserId: socket.data.user.id,
          payload
        });
        break;
      case 'group-message':
        socket.to(`group:${target}`).emit('message', {
          type: 'group-message',
          fromUserId: socket.data.user.id,
          groupId: target,
          payload
        });
        break;
      case 'ride-update':
        socket.to(`ride:${target}`).emit('message', {
          type: 'ride-update',
          fromUserId: socket.data.user.id,
          rideId: target,
          payload
        });
        break;
      default:
        // Handle unknown message types
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

const joinUserRooms = async (socket: any, userId: string) => {
  try {
    // Join user's personal room
    socket.join(`user:${userId}`);

    // TODO: Fetch user's groups and rides from database and join those rooms
    // Example:
    // const userGroups = await Group.findAll({ where: { userId } });
    // userGroups.forEach(group => socket.join(`group:${group.id}`));

    // const userRides = await Ride.findAll({ where: { userId } });
    // userRides.forEach(ride => socket.join(`ride:${ride.id}`));
  } catch (error) {
    console.error('Error joining rooms:', error);
  }
};

// Public API functions for other services to use
export const sendToUser = (userId: string, data: any) => {
  const userConnections = activeConnections.get(userId);
  if (userConnections) {
    userConnections.forEach(socketId => {
      const socket = socketInstances.get(socketId);
      if (socket) {
        socket.emit('message', data);
      }
    });
  }
};

export const broadcastToGroup = (groupId: string, data: any) => {
  const room = `group:${groupId}`;
   // @ts-ignore
  const { io } = global;
  io.to(room).emit('message', data);
};

export const broadcastToRide = (rideId: string, data: any) => {
  const room = `ride:${rideId}`;
   // @ts-ignore
  const { io } = global;
  io.to(room).emit('message', data);
};
