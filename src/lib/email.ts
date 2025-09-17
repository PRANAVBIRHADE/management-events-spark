import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const hasResend = !!process.env.RESEND_API_KEY;
const resend = hasResend ? new Resend(process.env.RESEND_API_KEY as string) : null;

async function sendViaNodemailer(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html });
}

export async function sendVerificationEmail(to: string, token: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${base}/verify?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Verify your email</h2>
      <p>Thanks for registering for the MPGI SOE Event Portal.</p>
      <p>Please verify your email by clicking the button below:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;background:#22d47b;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verify Email</a></p>
      <p>Or copy this link: <br/> ${verifyUrl}</p>
    </div>
  `;
  if (hasResend && resend) {
    await resend.emails.send({ from: process.env.EMAIL_FROM || 'no-reply@yourdomain.com', to, subject: 'Verify your email', html });
  } else {
    await sendViaNodemailer(to, 'Verify your email', html);
  }
}
