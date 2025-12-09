const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'NepEats <noreply@nep-eats.com>',
        to: email,
        subject: 'Verify Your Email - NepEats',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to NepEats!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for registering with NepEats. Please verify your email address to start ordering delicious food!</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #ea580c;">${verificationUrl}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 NepEats. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'NepEats <noreply@nep-eats.com>',
        to: email,
        subject: 'Reset Your Password - NepEats',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>We received a request to reset your password for your FoodMandu AI account.</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #ea580c;">${resetUrl}</p>
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This link will expire in 1 hour.
                        </div>
                        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 NepEats. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
    const transporter = createTransporter();
    const homeUrl = process.env.FRONTEND_URL;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'NepEats <noreply@nep-eats.com>',
        to: email,
        subject: 'Welcome to NepEats! 🎉',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .feature { margin: 10px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to NepEats!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Your email has been successfully verified! You're all set to start ordering delicious food.</p>
                        <div class="features">
                            <h3>What you can do now:</h3>
                            <div class="feature">✅ Browse our extensive menu</div>
                            <div class="feature">✅ Place orders with multiple payment options</div>
                            <div class="feature">✅ Track your deliveries in real-time</div>
                            <div class="feature">✅ Manage your profile and addresses</div>
                            <div class="feature">✅ Get personalized food recommendations</div>
                        </div>
                        <p style="text-align: center;">
                            <a href="${homeUrl}" class="button">Start Ordering Now</a>
                        </p>
                        <p>Thank you for choosing NepEats. We're excited to serve you!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 NepEats. All rights reserved.</p>
                        <p>Need help? Contact us at support@nep-eats.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (email, name) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'NepEats <noreply@nep-eats.com>',
        to: email,
        subject: 'Password Reset Successful - NepEats',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Password Reset Successful</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <div class="success">
                            Your password has been successfully reset.
                        </div>
                        <p>You can now log in to your NepEats account with your new password.</p>
                        <p>If you didn't make this change, please contact our support team immediately at support@nep-eats.com</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 NepEats. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset confirmation sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Send email OTP
const sendEmailOTP = async (email, name, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'NepEats <noreply@nep-eats.com>',
        to: email,
        subject: 'Your Verification Code - NepEats',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #ea580c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                    .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ea580c; font-family: monospace; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for registering with NepEats. Please use the verification code below to verify your email address:</p>
                        <div class="otp-box">
                            <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                            <div class="otp-code">${otp}</div>
                        </div>
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This code will expire in 10 minutes.
                        </div>
                        <p>If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 NepEats. All rights reserved.</p>
                        <p>Need help? Contact us at support@nep-eats.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email OTP sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending email OTP:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordResetConfirmation,
    sendEmailOTP
};
