import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fariskt101@gmail.com",
    pass: "lqyt xqfj xlsu nnbt",
  },
});

export const sendEmail = (recipientEmail, subject, text) => {
  const mailOption = {
    from: `"Zynk" <fariskt101@gmail.com>`,
    to: recipientEmail,
    subject: subject,
    text: text,
  };
  return transporter.sendMail(mailOption);
};
