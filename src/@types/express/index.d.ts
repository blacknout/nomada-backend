import { UserPayload } from "../userPayload";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        username?: string;
        email?: string;
        isAdmin?: boolean;
      }
    }
  }
}

export {}; 
