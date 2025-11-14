import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter (the service that will send the email)
  // We are using Mailtrap for testing
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Publib Admin <admin@publib.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // We can also send HTML emails
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
