import nodemailer from "nodemailer"


const sendMail = async (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: [email],
        subject: subject,
        text: text
    };

    await transporter.sendMail(mailOptions);
};

export { sendMail };
