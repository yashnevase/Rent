const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: '587',
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'yashnevse27@gmail.com',
        pass: 'ohydkhlwpqczuexs',
    },
});

const sendEmail = async (to, subject, html) => {
    console.log('--- Preparing to send email ---');
    console.log('Recipient:', to);
    console.log('Subject:', subject);
    console.log('HTML Content:', html);

    try {
        await transporter.sendMail({
            from: `"Rent Management" <${process.env.NODEMAILER_USER}>`,
            to: to,
            subject: subject,
            html: html,
        });
        console.log('--- Email sent successfully ---');
    } catch (error) {
        console.error('--- Error sending email ---', error);
    }
};

module.exports = { sendEmail };
