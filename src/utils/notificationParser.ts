import {
  GroupInviteNotification,
  UpcomingRideNotification,
  SOSNotification,
  GroupUpdateNotification,
  SystemNotification,
  NotificationBase,
  AppNotification,
  NotificationPriority,
  NotificationType
} from '../@types/model';

export function parseNotification(base: NotificationBase & { data?: any }): AppNotification {
  const data = base.data ?? {};

  switch (base.type) {
    case 'invite':
      return {
        ...base,
        ...data,
      } as GroupInviteNotification;

    case 'upcoming-ride':
      return {
        ...base,
        ...data,
      } as UpcomingRideNotification;

    case 'sos':
      return {
        ...base,
        ...data,
      } as SOSNotification;

    case 'group-update':
      return {
        ...base,
        ...data,
      } as GroupUpdateNotification;

    case 'system':
    case 'message':
    default:
      return base as SystemNotification;
  }
}

export const handleNotificationPriority = (
  priority: NotificationPriority, 
  notificationType: NotificationType
) => {
  if (priority === "high" || 
    notificationType === "sos") {
    return "high"
  }
  if (notificationType === "group-update" ||
    notificationType === "invite") {
      return "normal"
    } 
  return "default";
}