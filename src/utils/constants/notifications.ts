export const notification = {
  SOS_NOTIFICATION: (username:string = "Someone") => `${username} has triggered an emergency SOS alert!`,
  SOS_TITLE: "SOS EMERGENCY ALERT!",
  GROUP_INVITE: "Group Invite",
  GROUP_INVITE_MESSAGE: "You have been invited to join this group",
  SOS_CREATE_TITLE: "Someone made you an SOS contact.",
  SOS_CREATE_MESSAGE: (username: string) => `You have been added by ${username} as their SOS contact.
  If you do not know this person or do not want it, you can reject this request.`,
  SOS_REJECT_TITLE: "SOS contact rejection.",
  SOS_REJECT_MESSAGE: (username: string) => `${username} has rejected your request to assign them as an SOS contact.`,
  STOLEN_VIN_SEARCH_TITLE: "Your stolen bikes vin has been searched for.",
  STOLEN_VIN_SEARCH_MESSAGE: (plate: string, location: string) =>  `
    Your bike with your plate number ${plate} that you flagged as stolen was just searched for at ${location}.
  `,
};