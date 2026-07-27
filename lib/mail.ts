import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your NexSeat account",
    html: `<p>Welcome to NexSeat! Confirm your email to activate your account:</p>
           <p><a href="${link}">Verify my email</a></p>
           <p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your NexSeat password",
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${link}">Choose a new password</a></p>
           <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your NexSeat verification code",
    html: `<p>Your one-time code is:</p><h2 style="letter-spacing:4px">${otp}</h2>
           <p>This code expires in 10 minutes.</p>`,
  });
}
