/* eslint-disable no-console */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, token) {
    await transporter.sendMail({
        from: 'Book lending team <booklending_team@email.com>',
        to,
        subject,
        html: `<p>This is your token to update your password: ${token}. If you did not request a password update, ignore this e-mail.</p>`
    });
}
export default sendEmail;
