import  { Notification } from "../models/Notification";


export const createNotification = async(
  userId: string,
  title: string,
  message: string,
  type: "message" | "sos" | "invite",
  data: any
) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    data,
  });

  return notification;
}