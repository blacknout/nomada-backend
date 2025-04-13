import { Request, Response } from 'express';
import { 
  sendToUser, 
  broadcastToGroup, 
  broadcastToRide 
} from '../services/websocketService';
import errorResponse from '../errors/errorResponse';

// HTTP endpoint to send a message through WebSocket
export const sendWebSocketMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, messageType, payload } = req.body;
    const fromUserId = req.user.id;

    switch (targetType) {
      case 'user':
        sendToUser(targetId, {
          type: messageType,
          fromUserId,
          payload
        });
        break;
      case 'group':
        broadcastToGroup(targetId, {
          type: messageType,
          fromUserId,
          groupId: targetId,
          payload
        });
        break;
      case 'ride':
        broadcastToRide(targetId, {
          type: messageType,
          fromUserId,
          rideId: targetId,
          payload
        });
        break;
      default:
        res.status(400).json({ message: 'Invalid target type' });
        return;
    }

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    errorResponse(res, err);
  }
};

// Get WebSocket connection status
export const getConnectionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
     // @ts-ignore
    const {io} = global;
    const connectedClients = io?.sockets?.sockets?.size || 0;

    res.status(200).json({ 
      status: 'active',
      connections: connectedClients
    });
  } catch (err) {
    errorResponse(res, err);
  }
};