export const notification = {
  SOS_NOTIFICATION: "This user has sent you an SOS. The current location of the user is below.",
  SOS_TITLE: (username: string) =>  ` ${username} has sent an SOS to you`,
  GROUP_INVITE: "Group Invite",
  GROUP_INVITE_MESSAGE: "You have been invited to join this group",
  SOS_CREATE_TITLE: "Someone made you an SOS contact.",
  SOS_CREATE_MESSAGE: (username: string) => `You have been added by ${username} as their SOS contact.
  If you do not know this person or do not want it, you can reject this request.`,
  SOS_REJECT_TITLE: "SOS contact rejection.",
  SOS_REJECT_MESSAGE: (username: string) => `${username} has rejected your request to assign them as an SOS contact.`,

};