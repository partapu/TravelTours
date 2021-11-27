const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltotext = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'preetham partapu <preethampartapu029@gmail.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: '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',
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1. Render html based on pug
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );
    //2.Define email options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmltotext.fromString(html),
    };

    //3.create transport
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the TravelTours Familiy');
  }

  async sendPasswordResetToken() {
    await this.send(
      'resetPassword',
      'TravelTours password reset token valid for 10 mins!'
    );
  }
};

// const sendEmail = async (options) => {
//   //1.Create a transported
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //2.Define the email options
//   const mailOptions = {
//     from: 'partapu preetham <preethampartapu029@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html:
//   };
//   await transporter.sendMail(mailOptions);
// };
