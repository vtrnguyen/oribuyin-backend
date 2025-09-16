const nodemailer = require('nodemailer');
const { getEmailTemplate } = require("../utils/email-template.util");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

const sendMail = async (type, to, data = {}) => {
    const { subject, html, text } = getEmailTemplate(type, data);
    const mailOptions = {
        from: process.env.FROM_EMAIL || 'no-reply@oribuyin.com',
        to,
        subject,
        html,
        text,
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
