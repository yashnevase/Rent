const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SENDER_EMAIL
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
    tls: {
    rejectUnauthorized: false, // <--- disables cert validation
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @returns {Promise}
 */
async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject,
    text,
    html
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Nodemailer sendMail result:', info);
  return info;
}

module.exports = { sendMail };
