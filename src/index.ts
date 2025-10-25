import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Email from "email-templates";
import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "development";

if (env === "development") {
  dotenv.config();
}

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: process.env.PROVIDER,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

app.post("/contact-us", async (req: Request, res: Response) => {
  const {
    from,
    subject,
    message,
    firstName,
    lastName,
    countryCode,
    phoneNumber,
  } = req.body;
  const to = process.env.RECIPIENT;

  console.log(`from: ${from}`);
  console.log(`to: ${to}`);
  console.log(`firstName: ${firstName}`);
  console.log(`lastName: ${lastName}`);
  console.log(`subject: ${subject}`);
  console.log(`message: ${message}`);
  console.log(`countryCode: ${countryCode}`);
  console.log(`phoneNumber: ${phoneNumber}`);
  console.log(fs.existsSync(path.join(__dirname, "emails")));

  if (!from || !to || !firstName || !lastName || !subject || !message) {
    return res.status(400).json({
      error:
        "Missing required fields: from, to, firstName, lastName, subject, message",
    });
  }

  try {
    const email = new Email({
      message: {
        from,
        subject,
      },
      transport: transporter,
      views: {
        options: { extension: "ejs" }, // Or 'hbs' for Handlebars
        // Use an absolute path to ensure correct resolution in production
        root: path.resolve(__dirname, "emails"),
      },
      juice: true, // Enable CSS inlining (set to false if not needed)
      preview: true, // Enable browser previews in development
      send: true, // Set to false in development to avoid accidental sends; true for production
    });

    const info = await email.send({
      template: "customer-enquiry",
      message: { to, subject },
      locals: {
        firstName,
        lastName,
        countryCode: countryCode ?? "N/A",
        phoneNumber: phoneNumber ?? "N/A",
        customerMessage: message,
      },
    });
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
