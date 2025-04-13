import { Server } from 'socket.io';
import { UserPayload } from './src/@types/userPayload';

declare module 'socket.io' {
  interface Socket {
    data: {
      user: UserPayload;
    };
  }

  interface Server {
    io: Server;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      io: Server;
    }
  }
}

// This is needed for modern Node.js versions
declare module globalThis {
  var io: Server;
} 
