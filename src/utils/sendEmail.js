const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, { senderName, message }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333;">📬 New Message from ${senderName}</h2>
        <p style="font-size: 16px; color: #444;">
          You have received a new message on <strong>CodeMate</strong>:
        </p>
        <blockquote style="border-left: 4px solid #4e73df; margin: 20px 0; padding-left: 15px; color: #555; font-style: italic;">
          "${message}"
        </blockquote>
        <p style="font-size: 15px; color: #555;">
          Login to Codemate to reply to this message.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://codemate-web.onrender.com/" style="padding: 12px 20px; background-color: #4e73df; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
             Open Chat
          </a>
        </div>
        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 40px;">
          You are receiving this email because you have an account with CodeMate.<br>
          © ${new Date().getFullYear()} CodeMate. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"CodeMate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: `${senderName} sent you a message: ${message}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error(" Email failed:", error);
  }
};

module.exports = sendEmail;
