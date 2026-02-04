import nodemailer from "nodemailer"
import OTP from "../modals/otpModal.js";


const AppKey = process.env.APP_KEY

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false, 
  auth: {
    user: "a2guggi11052002@gmail.com",
    pass: AppKey,
  },
});

export async function sendOtpService(email) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

     const info = await transporter.sendMail({
    from: '"Storage App" <a2guggi11052002@gmail.com>',
    to: email,
    subject: "Storage App OTP",
    html 
  });

  return { success: true, message: "OTP sent successfully" };
}
