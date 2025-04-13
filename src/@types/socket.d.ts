import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UserPayload } from './userPayload';

declare module 'socket.io' {
  interface Socket {
    data: {
      user: UserPayload;
    };
  }
}

declare global {
  var io: Server | undefined;
}

export {};