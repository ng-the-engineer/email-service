"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Configure Nodemailer transporter with Gmail SMTP
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'engineer.anthony.ng@gmail.com',
        pass: 'xxtk wakx tkqx ynir',
    },
});
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Send email route
app.post('/send-email', async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
