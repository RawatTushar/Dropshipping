const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate email confirmation token
const generateConfirmationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email confirmation
const sendEmailConfirmation = async (email, confirmationToken) => {
  try {
    const transporter = createTransporter();
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Email - Dropshipping Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Dropshipping!</h2>
          <p>Thank you for registering with us. Please confirm your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
          <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
};

const sendLoginOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your login code - Dropshipping",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Login verification</h2>
        <p>Use this one-time code to sign in:</p>
        <p style="font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #007bff;">${otp}</p>
        <p style="color: #666; font-size: 12px;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
      </div>
    `,
    };
    await transporter.sendMail(mailOptions);
    console.log("Login OTP email sent to:", email);
  } catch (error) {
    console.error("sendLoginOtpEmail:", error);
    throw new Error(
      error.message ||
        "Gmail rejected the message. Use an App Password if 2FA is on, or check EMAIL_USER / EMAIL_PASS."
    );
  }
};

module.exports = {
  sendEmailConfirmation,
  generateConfirmationToken,
  sendLoginOtpEmail,
};
