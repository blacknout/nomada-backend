import { StringColorFormat } from "@faker-js/faker/.";

export type RideStatusType =
  | 'pending'
  | 'started'
  | 'completed';

  export type GroupMemberType =
  | "active" 
  | "ghost" 
  | "observer" 
  | "inactive";
  

export type NotificationType =
  | 'invite'
  | 'message'
  | 'upcoming-ride'
  | 'sos'
  | 'group-update'
  |  'search-vin'
  | 'system';
  
export type NotificationPriority = 'high' | 'medium' | 'low';

export type AppNotification =
  | GroupInviteNotification
  | UpcomingRideNotification
  | SOSNotification
  | GroupUpdateNotification
  | SearchVinNotification
  | SystemNotification;

export interface NotificationBase {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: NotificationPriority;
}

export interface GroupInviteNotification extends NotificationBase {
  type: 'invite';
  inviteId: string;
  groupId: string;
  groupName: string;
  senderId: string;
  senderName: string;
}

export interface UpcomingRideNotification extends NotificationBase {
  type: 'upcoming-ride';
  rideId: string;
  rideName: string;
  startTime: string;
  groupId: string;
  groupName: string;
}

export interface SOSNotification extends NotificationBase {
  type: 'sos';
  username: string;
  plate: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  currentRide?: string;
  emergencyMessage?: string;
}

export interface GroupUpdateNotification extends NotificationBase {
  type: 'group-update';
  groupId: string;
  groupName: string;
  updateType: 'new-member' | 'left-group' | 'role-change' | 'other';
  relatedUserId?: string;
  relatedUserName?: string;
}

export interface SearchVinNotification extends NotificationBase {
  type: 'search-vin';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  bikeId: string;
  username: string;
  firstname: String;
  lastname: string;
}

export interface SystemNotification extends NotificationBase {
  type: 'system';
}