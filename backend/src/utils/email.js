import nodemailer from 'nodemailer';
import config from '../config/env.js';

// E-POSTA GÖNDERME SERVİSİ:
// Uygulama içinden e-posta göndermek için `nodemailer` kütüphanesini kullanır.
// Şifre sıfırlama, kullanıcı doğrulama gibi işlemlerde kullanılır.
const sendEmail = async (options) => {
  // const transporter = nodemailer.createTransport({
  //   host: config.EMAIL_HOST,
  //   port: config.EMAIL_PORT,
  //   auth: {
  //     user: config.EMAIL_USERNAME,
  //     pass: config.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT == 465,
    auth: {
      user: config.EMAIL_USERNAME,
      pass: config.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
