import nodemailer from "nodemailer";

const appKey = process.env.APP_KEY;
const mailFrom = process.env.MAIL_FROM || "a2guggi11052002@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: mailFrom,
    pass: appKey,
  },
});

export async function sendShareInviteService({
  to,
  ownerName,
  fileName,
  permission,
  inviteUrl,
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h2>${ownerName} shared a file with you</h2>
      <p><strong>File:</strong> ${fileName}</p>
      <p><strong>Permission:</strong> ${permission}</p>
      <p><a href="${inviteUrl}" target="_blank" rel="noreferrer">Open shared file</a></p>
      <p>If you don't recognize this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CloudVault" <${mailFrom}>`,
    to,
    subject: `${ownerName} shared ${fileName} with you`,
    html,
  });
}
