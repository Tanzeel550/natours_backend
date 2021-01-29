const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'PRODUCTION') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT * 1,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send the actual email
    async send(subject, message, linkMessage) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/emailTemplate.pug`, {
            name: this.firstName,
            url: this.url,
            message,
            linkMessage
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendLoginEmail() {
        await this.send(
            'Login on Natours (Valid for 10 minutes)',
            "We have received a login request from you. If you didn't sent this request. Than ignore it",
            'Click here to Login'
        );
    }

    async sendSignUpEmail() {
        await this.send(
            'SignUp on Natours (Valid for 10 minutes)',
            "We have received a signUp request from you. If you didn't sent this request. Than ignore it",
            'Click here to signUp'
        );
    }

    async sendWelcome() {
        await this.send(
            'Welcome to Natours',
            "Welcome to Natours, we're glad to have you 🎉🙏\nWe're all a big family here, so make sure to upload your user photo so we get to know you a bit better!\n",
            'Upload User Photo'
        );
    }

    async sendPasswordReset() {
        await this.send(
            'Password Reset (Valid for 10 minutes)',
            'Go to the following link to reset your Password',
            'Click to Reset Password'
        );
    }
};
