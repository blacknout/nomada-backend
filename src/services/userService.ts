import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { WEEK_TOKEN_EXPIRATION } from "../utils/constants/constants";

export const generateTokenAndUpdate = async (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
      user: user.username,
      firstname: user.firstname,
      email: user.email,
      lastname: user.lastname,
      isAdmin: user.isAdmin,
      country: user.country,
      state: user.state,
      phone: user.phone,
      avatar: user.avatar
    },
    process.env.JWT_SECRET as string,
    { expiresIn: WEEK_TOKEN_EXPIRATION }
  );

  await user.update({
    isVerified: true,
    otp: null,
    otpExpires: null,
    token: token,
  });
  return token;
}