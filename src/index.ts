import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
const env = process.env.NODE_ENV || "development";

if (env === "development") {
  dotenv.config();
}

// Create Express app
const app = express();
app.use(express.json());

// Configure Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: process.env.PROVIDER,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Send email route
app.post("/contact-us", async (req: Request, res: Response) => {
  console.log("body: ", req.body);
  const { from, subject, text } = req.body;
  const to = process.env.RECIEPIENT;

  if (!from || !to || !subject || !text) {
    return res
      .status(400)
      .json({ error: "Missing required fields: from, to, subject, text" });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
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
