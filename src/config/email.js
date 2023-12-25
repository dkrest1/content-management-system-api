const nodemailer = require('nodemailer');
const { SMTP_USERNAME, SMTP_PASSWORD } = require('./constant');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

const sendMail = async (params) => {
  try {
    await transporter.sendMail({
      from: SMTP_USERNAME,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports = sendMail;
