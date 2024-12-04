import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const sendEmail = async (to, subject, text) => {
    // Ensure email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS is not set in the environment variables.");
    }

    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {

        console.error('Error sending email:', error);
        throw new Error('Failed to send email: ' + error.message);
    }
};

export default sendEmail;
