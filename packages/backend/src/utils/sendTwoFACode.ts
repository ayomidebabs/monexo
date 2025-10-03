import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
 auth: {
 user: process.env.EMAIL_USER, 
 pass: process.env.EMAIL_PASS, 
 },
});

const send2FACode = async (email: string, code: number) => {
    try {
        await transporter.sendMail({
            from: '"Lockout App" <your-email@gmail.com>',
            to: email,
            subject: 'Your 2FA Code',
            text: `Your verification code is ${code}. It expires in 10 minutes.`,
        });
        console.log(`2FA code sent to ${email}`);
    } catch (err) {
        console.error('Email send failed:', err);
        throw new Error('Failed to send 2FA code');
    }
};

export const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
