export interface UserPayload {
  id: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  // add other properties that might be in the decoded token
} 
