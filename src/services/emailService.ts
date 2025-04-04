import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (user: User) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

  await user.update({ otp, otpExpires });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. Please use within 15 minutes.`,
  });

  return { message: `OTP sent successfully` };
};

export const sendPasswordResetEmail = async (user: User, token: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

  await user.update({ otp, otpExpires, token });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset Your Password",
    text: `You have made a request to reset your password. If this was not you, please ignore this email. 
    Here is yout OTP.

            ${otp}
    
    Please use within 15 minutes.
    
    The Nomada Team.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Email sent:", info.response);
    }
  });

  return { message: "Password reset link sent successfully" };
};