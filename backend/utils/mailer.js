// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, code) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Tu código para restablecer contraseña',
    html: `
      <p>Tu código de verificación es:</p>
      <h2 style="letter-spacing:3px;">${code}</h2>
      <p>Expira en ${process.env.RESET_OTP_TTL_MINUTES || 10} minutos.</p>
      <p>Si no solicitaste este código, ignora este mensaje.</p>
    `,
  });
}

module.exports = { sendOtpEmail };
