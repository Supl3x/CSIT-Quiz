// import nodemailer from "nodemailer"

import sendGrid from "@sendgrid/mail"

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: true,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

// transporter.verify(function (error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Server is ready to take our messages for email');
//     }
// });

export const sendEmail = async function (to, subject, html) {
    try {
        const msg = {
            from: process.env.EMAIL_SENDER,
            to,
            subject,
            text: subject,
            html,
        };

        const info = await sendGrid.send(msg)

        console.log('Email sent:', info);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.response?.body || error);
        throw error;
    }
};
