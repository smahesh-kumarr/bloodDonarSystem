const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    // We are MANUALLY configuring port 587 (TLS) because port 465 (SSL/Implicit)
    // is often blocked, causing ETIMEDOUT errors.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // Use 587 for TLS (STARTTLS)
      secure: false, // Must be false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Helps in dev environments where certificates might be self-signed or weird
        rejectUnauthorized: false,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: `"Blood Donor App" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;
