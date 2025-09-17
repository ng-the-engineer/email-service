import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Create Express app
const app = express();
app.use(express.json());

// Configure Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'engineer.anthony.ng@gmail.com',
    pass: 'xxtk wakx tkqx ynir',
  },
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Send email route
app.post('/send-email', async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: to, subject, text' });
  }

  try {
    const info = await transporter.sendMail({
      from: 'engineer.anthony.ng@gmail.com',
      to,
      subject,
      text,
    });
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
