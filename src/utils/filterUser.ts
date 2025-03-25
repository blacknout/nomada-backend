
export const filterUser = (user: any) => {
  const { password, ...filteredUser } = user;
  return filteredUser;
}
