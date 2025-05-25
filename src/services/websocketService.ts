// @ts-nocheck
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../@types/userPayload';
import { User } from "../models/User";
import { RideStop } from "../models/RideStop";
import { Sos } from "../models/Sos";
import { RideStopPayload, RideUpdatePayload } from "../@types/websocket";
import { sendSos } from "../services/sosService";

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
    const { type, target, payload } = data;

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
        const rideUpdatePayload: RideUpdatePayload = {
          latitude: payload.latitude,
          longitude: payload.longitude,
          heading: payload.heading,
          speed: payload.speed
        }

        socket.to(`ride:${target}`).emit('message', {
          type: 'ride-update',
          fromUserId: socket.data.user.id,
          rideId: target,
          rideUpdatePayload
        });
        break;
      case 'ride-stop':
        const rideStopPayload: RideStopPayload = {
          action: payload.action,
          reason: payload.reason,
          location: payload.location,
          isResolved: payload.isResolved,
          sos: payload.sos
        }

        handleRideStop({
          type: target,
          fromUserId: socket.data.user.id,
          rideId: target,
          rideStopPayload
        });
        break;
      case 'notification-update':
        sendToUser(target, {
          type: 'notification-update',
          fromUserId: socket.data.user.id,
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
export const sendToUser = (target: any, data: any) => {
  const userConnections = activeConnections.get(data.fromUserId);
  if (userConnections) {
    userConnections.forEach(socketId => {
      const socket = socketInstances.get(socketId);
      if (socket) {
        socket.emit('message', data);
      }
    });
  }
};

export const broadcastToGroup = (data: any) => {
  const room = `group:${data.groupId}`;
  const { io } = global;
  io.to(room).emit('message', data);
};

export const broadcastToRide = (data: any) => {
  const room = `ride:${data.rideId}`;
  const { io } = global;
  io.to(room).emit('message', data);
};

export const sendNotificationUpdate = (userId: string | string[], notificationData: any) => {
  // Handle single user or array of users
  const userIds = Array.isArray(userId) ? userId : [userId];
  
  userIds.forEach(id => {
    const userConnections = activeConnections.get(id);
    if (userConnections) {
      userConnections.forEach(socketId => {
        const socket = socketInstances.get(socketId);
        if (socket) {
          socket.emit('message', {
            type: 'notification-update',
            payload: notificationData
          });
        }
      });
    }
  });
};
// Send notification to a single user (e.g., group invitation)
// sendNotificationUpdate('user123', {
//   title: 'Group Invitation',
//   message: 'You have been invited to join "Weekend Riders"',
//   type: 'group_invitation',
//   groupId: 'group456'
// });

// // Send notification to multiple users (e.g., ride update)
// sendNotificationUpdate(['user1', 'user2', 'user3'], {
//   title: 'Ride Update',
//   message: 'Your ride has been updated',
//   type: 'ride_update',
//   rideId: 'ride789'
// });


export const handleRideStop = async (data: any) => {
  const { reason, action, sos } = data.payload;
  if (reason === "safe") return;
  if (sos) {
    const user = await User.findByPk(data.fromUserId, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | [] };
    await sendSos(user, data.payload.location, data.rideId);
  } 
  if (action === "create") await createRideStop(data);
  else if (action === "update") await updateRideStop(data);
  else if (action === "delete") await deleteRideStop(data)
  
}

const createRideStop = async(data: any) => {
  try {
    const user = await User.findByPk(data.fromUserId);

    if (user) {
      const rideStop = await RideStop.create({
        rideId: data.rideId,
        userId: user.id,
        reason: data.payload.reason,
        location: data.payload.location,
      });
    
      const room = `ride:${data.rideId}`;
  
      const rideStopData = {
        reason: data.payload.reason,
        location: data.payload.location,
        fromUserId: data.fromUserId,
        user,
        rideStopId: rideStop.id,
        sos: data.payload.sos
      }
      const { io } = global;
      io.to(room).emit('ride-stop', rideStopData);
    }
  } catch (error) {
    console.log(error);
  }
}

const updateRideStop = async(data: any) => {
  try {
    const rideStop = await RideStop.findByPk(data.rideStopId);
    if (rideStop) {
      const room = `ride:${rideStop.rideId}`;
  
      const rideStopData = {
        reason: data.payload.reason || rideStop.reason,
        location: data.payload.location || rideStop.location,
        fromUserId: data.fromUserId,
        rideStopId: rideStop.id,
        isResolved: data.payload.isResolved
      }
      const { io } = global;
      io.to(room).emit('ride-stop', rideStopData);

      rideStop.reason = rideStopData.reason;
      rideStop.location = rideStopData.location;
      rideStop.isResolved = rideStopData.isResolved;
      await rideStop.save();
    }
  } catch (error) {
    console.log(error)
  }
}

const deleteRideStop = async(data: any) => {
  const rideStop = await RideStop.findByPk(data.rideStopId);
  if (rideStop) {
    const room = `ride:${rideStop.rideId}`;
    const rideStopData = {
      action: data.payload.action,
      rideStopId: rideStop.id
    }
    const { io } = global;
    io.to(room).emit('ride-stop', rideStopData);
    await rideStop.destroy();
  }
}
