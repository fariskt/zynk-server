const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "fariskt101@gmail.com",
        pass: "lqyt xqfj xlsu nnbt"
    }
})

const sendEmail = (recipientEmail , subject , text)=> {
    const mailOption = {
        from : "fariskt101@gmail.com",
        to: recipientEmail,
        subject: subject,
        text: text
    }
    return transporter.sendMail(mailOption)
}

module.exports = {sendEmail}