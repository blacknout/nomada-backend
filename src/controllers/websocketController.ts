import { Request, Response } from 'express';
import { 
  sendToUser, 
  broadcastToGroup, 
  broadcastToRide,
  handleRideStop
} from '../services/websocketService';
import errorResponse from '../errors/errorResponse';

// HTTP endpoint to send a message through WebSocket
export const sendWebSocketMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target, targetId, payload } = req.body;
    const fromUserId = req.user.id;

    switch (target) {
      case 'user':
        sendToUser(target, {
          type: target,
          fromUserId,
          payload
        });
        break;
      case 'group':
        broadcastToGroup({
          type: target,
          fromUserId,
          groupId: targetId,
          payload
        });
        break;
      case 'ride':
        broadcastToRide({
          type: target,
          fromUserId,
          rideId: targetId,
          payload
        });
        break;
        case 'ride-stop':
          handleRideStop({
            type: target,
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