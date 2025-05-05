export type NotificationType =
  | 'invite'
  | 'message'
  | 'upcoming-ride'
  | 'sos'
  | 'group-update'
  | 'system';
  
export type NotificationPriority = 'high' | 'medium' | 'low';

export type AppNotification =
  | GroupInviteNotification
  | UpcomingRideNotification
  | SOSNotification
  | GroupUpdateNotification
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
  groupId?: string;
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

export interface SystemNotification extends NotificationBase {
  type: 'system';
}