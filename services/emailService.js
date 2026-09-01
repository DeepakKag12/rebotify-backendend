import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP - Rebotify",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${name}!</h2>
          <p style="font-size: 16px; color: #555;">Your OTP for login is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes.</p>
          <p style="font-size: 14px; color: #777;">If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Best regards,<br>Rebotify Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (email, userName, token) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4173";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Rebot password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p style="font-size: 16px; color: #555;">We received a request to reset your password.</p>
          <p style="font-size: 16px; color: #555;">Click the button below to choose a new password:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #16a34a; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #777;">If the button does not work, use this link:</p>
          <p style="font-size: 14px; color: #777; word-break: break-all;">${resetLink}</p>
          <p style="font-size: 14px; color: #777;">This link is valid for 1 hour.</p>
          <p style="font-size: 14px; color: #777;">If you did not request this, you can ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Best regards,<br>Rebotify Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
};
