import nodemailer from 'nodemailer';

// E-POSTA GÖNDERME SERVİSİ:
// Uygulama içinden e-posta göndermek için `nodemailer` kütüphanesini kullanır.
// Şifre sıfırlama, kullanıcı doğrulama gibi işlemlerde kullanılır.
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Publib Admin <admin@publib.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
