// import { sendError, sendResponse } from "../utils/response.js";

import pool from "../config/db.js";
import { sendError, sendResponse } from "../utils/response.js";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";




export const login = async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    "supersecretkey",
    { expiresIn: "1d" }
  );
  res.json({ token, user });
}


// Utility: Send Email
export const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || 'packageitappofficially@gmail.com',
      pass: process.env.EMAIL_PASS || 'epvuqqesdioohjvi',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: ` <${process.env.EMAIL_USER || 'sagar.kiaan12@gmail.com'}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Controller: Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(404).json({ status: "false", message: "User not found." });
    }

    if (user[0].googleSignIn === "true") {
      return res.status(400).json({ status: "false", message: "Password reset not allowed for Google Sign-In users." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
      [resetToken, resetTokenExpiry, email]
    );

    const resetLink = `https://sow-management.netlify.app/resetpassword?token=${resetToken}`;

    // Compose email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

          <div style="text-align: center; margin-bottom: 20px;">
            <img src="" alt=" Logo" style="height: 60px;" />
          </div>

          <h2 style="text-align: center; color: #2c3e50;">🔐 Reset Your Password</h2>

          <p style="font-size: 16px; color: #34495e;">Hello,</p>

          <p style="font-size: 15px; color: #555555; line-height: 1.6;">
            You recently requested to reset your password for your <strong>SOW</strong> account.
            Use the token below or click the link to complete the process. This token is valid for only <strong>15 minutes</strong>.
            If you did not request this, you can safely ignore this email.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <span style="display: inline-block; background-color: #ecf0f1; padding: 15px 25px; font-size: 18px; font-weight: bold; color: #2c3e50; border-radius: 6px; letter-spacing: 1px;">
              ${resetToken}
            </span>
          </div>

          <div style="margin: 20px 0; text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #2c3e50; color: #ffffff; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; text-decoration: none;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #e74c3c; font-weight: bold;">
            ⚠ Token expires in 15 minutes. Do not share it.
          </p>

          <p style="font-size: 14px; color: #555555; margin-top: 20px;">
            Need help? Just reply to this email and our support team will assist you.
          </p>

          <p style="font-size: 14px; color: #2c3e50;">
            Best regards,<br>
            <strong>SOW Support Team</strong>
          </p>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;" />

          <p style="font-size: 12px; text-align: center; color: #999999;">
            &copy; ${new Date().getFullYear()} SOW. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await sendEmail(email, "Password Reset Token", htmlContent);

    res.status(200).json({
      status: "true",
      message: "Reset token sent successfully to your email.",
      resetToken,
    //  resetLink,
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ status: "false", message: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Check if all fields exist
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "false",
        message: "Reset token, new password, and confirm password are required.",
      });
    }

    // Match passwords
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "false",
        message: "New password and confirm password do not match.",
      });
    }

    // Find user with valid resetToken
    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [resetToken]
    );

    if (userRows.length === 0) {
      return res.status(400).json({
        status: "false",
        message: "Invalid or expired reset token.",
      });
    }

    const user = userRows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove resetToken
    await pool.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.status(200).json({
      status: "true",
      message: "Password has been reset successfully.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      status: "false",
      message: "Server error",
    });
  }
};

  
// export const updatePassword = async (req, res) => {
//     const {  newPassword } = req.body;
//     const { userId } = req.params;
//       // const [[ user ]] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);

//       // const match = await bcrypt.compare(oldPassword, user.password);
//       // if (!match) return sendError(res, 400, 'password is incorrect');

//       const hashed = await bcrypt.hash(newPassword, 10);
//       await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, userId]);


//       res.json(  { message: 'Password updated successfully'})
//       // return sendResponse(res, 201, 'Password updated successfully');
   
//     };

      
       


export const updatePassword = async (req, res) => {
  const { newPassword } = req.body || {};
  const { userId } = req.params;

  if (!newPassword) return sendError(res, 400, 'New password is required');

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, userId]);

  return sendResponse(res, 200, 'Password updated successfully');
};

