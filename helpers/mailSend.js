const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

async function sendmail(templateName, templateData, to, subject) {
  try {
    // Create reusable transporter object using the default SMTP transport
    const {
      SMTP_HOST,
      EMAILID,
      PASSWORD,
    } = process.env;

    // 👉 DEV MODE (no email config)
    if (
      !SMTP_HOST ||
      SMTP_HOST === "127.0.0.1" ||
      !EMAILID ||
      !PASSWORD
    ) {
      console.log("\n📩 EMAIL (DEV MODE)");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("📦 Template:", templateName);

      if (templateData?.resetUrl) {
        console.log("🔗 Reset Link:", templateData.resetUrl);
      } else {
        console.log("📄 Data:", templateData);
      }

      return { success: true, devMode: true };
    }

    // 👉 REAL EMAIL MODE
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: EMAILID,
        pass: PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // Read the email template file
    const templatePath = path.join(__dirname, "../templates", templateName);
    const source = fs.readFileSync(templatePath, "utf8");

    // Compile the template
    const template = handlebars.compile(source);
    const html = template(templateData);

    // Setup email data
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Your Store"}" <${process.env.EMAILID
        }>`,
      to,
      subject,
      html,
      // You can also add a text version for email clients that don't support HTML
      text: `Thank you for your order #${templateData.order?.id || ""
        }. Please find your order details below.`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = { sendmail };
