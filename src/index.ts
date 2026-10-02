import express, { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Email from "email-templates";
import path from "path";

const env = process.env.NODE_ENV || "development";
const allowedFrontEndOrigin = process.env.ALLOWED_FRONTEND_ORIGIN;

if (env === "development") {
  dotenv.config();
}

const app = express();
app.use(express.json());

const microsoftOAuthProvision = (
  _user: string,
  _renew: boolean,
  callback: (error: Error | null, accessToken: string, expires: number) => void,
) => {
  const body = new URLSearchParams({
    client_id: process.env.SMTP_CLIENT_ID || "",
    client_secret: process.env.SMTP_CLIENT_SECRET || "",
    refresh_token: process.env.SMTP_REFRESH_TOKEN || "",
    grant_type: "refresh_token",
    scope: "https://outlook.office.com/SMTP.Send",
  });

  fetch(
    `https://login.microsoftonline.com/${
      process.env.MICROSOFT_TENANT_ID || "common"
    }/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  )
    .then(async (response) => {
      const result = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        error_description?: string;
      };
      if (!response.ok || !result.access_token) {
        throw new Error(
          result.error_description || "Microsoft OAuth token request failed",
        );
      }
      callback(null, result.access_token, result.expires_in || 0);
    })
    .catch((error: unknown) => {
      callback(
        error instanceof Error ? error : new Error("Microsoft OAuth failed"),
        "",
        0,
      );
    });
};

const smtpAuth =
  process.env.SMTP_AUTH_METHOD === "oauth2"
    ? {
        type: "OAuth2" as const,
        user: process.env.SMTP_USER,
        clientId: process.env.SMTP_CLIENT_ID,
        clientSecret: process.env.SMTP_CLIENT_SECRET,
        refreshToken: process.env.SMTP_REFRESH_TOKEN,
        accessUrl: `https://login.microsoftonline.com/${
          process.env.MICROSOFT_TENANT_ID || "common"
        }/oauth2/v2.0/token`,
        customParams: {
          scope: "https://outlook.office.com/SMTP.Send",
        },
        provisionCallback: microsoftOAuthProvision,
      }
    : {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      };

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: smtpAuth,
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedFrontEndOrigin); // Allow frontend origin
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(200); // Respond to preflight
  } else {
    next();
  }
});

app.post("/contact-us", async (req: Request, res: Response) => {
  const {
    from,
    subject,
    message,
    firstName,
    lastName,
    countryCode,
    mobileNumber,
  } = req.body;
  const to = process.env.RECIPIENT;

  if (!from || !to || !firstName || !lastName || !subject || !message) {
    return res.status(400).json({
      error:
        "Missing required fields: from, to, firstName, lastName, subject, message",
    });
  }

  try {
    const email = new Email({
      message: {
        from: process.env.SMTP_USER,
        replyTo: from,
        subject,
      },
      transport: transporter,
      views: {
        options: { extension: "ejs" },
        root: path.join(__dirname, "emails"),
      },
      juice: true, // Enable CSS inlining (set to false if not needed)
      preview: true, // Enable browser previews in development
      send: false, // Set to false in development to avoid accidental sends; true for production
    });

    const info = await email.send({
      template: path.join(__dirname, "emails"),
      message: { to, subject },
      locals: {
        firstName,
        lastName,
        countryCode: countryCode ?? "N/A",
        mobileNumber: mobileNumber ?? "N/A",
        from,
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
