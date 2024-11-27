import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
    try {
        // Create a transport object using nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can replace this with other services like 'hotmail' or 'yahoo'
            auth: {
                user: process.env.EMAIL_USER, // Ensure EMAIL_USER is set in your environment variables
                pass: process.env.EMAIL_PASS, // Ensure EMAIL_PASS is set in your environment variables
            },
            tls: {
                rejectUnauthorized: false, // Disable certificate validation for self-signed certificates (not recommended for production)
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // The 'from' email address (usually the same as EMAIL_USER)
            to,
            subject,
            text,
        };

        // Send the email using nodemailer
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email: ' + error.message);
    }
};

export default sendEmail;
