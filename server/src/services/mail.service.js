import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendBarberInviteEmail = async ({ email, token, salonName }) => {
  const link = `${process.env.CLIENT_URL}/barber-register?token=${token}`;
  await transporter.sendMail({
    from: `NextCut <${process.env.SMTP_USER}>`,
    to: email,
    subject: `NextCut barber invite for ${salonName}`,
    html: `<p>You were invited to join <b>${salonName}</b> on NextCut.</p><p>Complete signup: <a href="${link}">${link}</a></p>`,
  });
};

export { sendBarberInviteEmail };
