require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking-System" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Banking-System";
  const text = `Hello ${name}, \n\nThank you for registering at Bakning-System.
  We're excited to have you on board! \n\nBest regards, \nThe Banking-System Team`;
  const html = `<p>Hello ${name}, </p><p>Thank you for registering at Bakning-System.
  We're excited to have you on board!</p><p>Best regards, <br>The Banking-System Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendAccountCreationEmail(userEmail, name) {
  const subject = "Your Banking-System Account Has Been Created";
  const text = `Hello ${name}, \n\nCongratulations! Your bank account has been successfully created with Banking-System. Your account is now active and ready to use. You can now access your account and start managing your banking activities.Thank you for choosing Banking-System.Best regards,The Banking-System Team`;
  const html = `<p>Hello ${name},</p><p>Congratulations! Your bank account has been successfully created with <strong>Banking-System</strong>.</p><p>Your account is now <strong>active</strong> and ready to use.You can now access your account and start managing your banking activities.</p><p>Thank you for choosing Banking-System.</p><p>Best regards,<br><strong>The Banking-System Team</strong></p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendAccountCreationEmail };
