## Email Service

API server to send email to predefined recipient via SMTP protocol.

Node library `email-templates` is used to preserve HTML and CSS.

### Email Template Setting

- The email template is defined in path `src/emails/html.ejs`
- Typescript compile command copy the static files to `dist/emails/html.ejs`.
- However, the Typescript command `tsc` running in Vercel does not copy the emails directory in `dist`.
- A work around is to copy the templates folder by running the create folder and copy directory command in Vercel Build and Deployment settings (see section "Deployment to Vercel").

### Local Development

#### Environment Variables

- Duplicate .env.sample and rename it to .env
- Fill in the values for the variables
- If NODE_ENV equals development, the app load the variables from .env

#### Run app against src folder

1. `npm install`
2. `npm run dev`

#### Run app against dist folder (pre-deployment)

1. `npm run build`
2. `npm run start`

#### Enable/ disable Preview

In the EmailConfig object, enable `preview: true` allowing you to preview the email in your browser.

#### Enable/ disable Send

In EmailConfig object, make sure `send: true` to send the email to the SMTP provider.

### Deployment to Vercel

In Vercel project,

1. Go to Setting,
2. go to Build and Deployment
3. In Framework Setting, make sure

- Build Command: `tsc`
- Output Directory: `dist`
- Install Command: `npm install -g typescript && npm install && mkdir -p dist/emails/ && cp -r src/emails/ dist/`

#### Gmail SMTP settings

The Vercel environment variables must be configured for the Production environment:

- `PROVIDER`: `gmail`
- `SMTP_USER`: the full Gmail or Google Workspace email address
- `SMTP_PASSWORD`: a Google App Password for `SMTP_USER`, not the normal Google account password
- `RECIPIENT`: the address that should receive contact messages

To create an App Password, enable 2-Step Verification on the Google account, then create one under Google Account > Security > App passwords. Enter the generated 16-character value in Vercel without quotation marks. Redeploy after changing the variables.

The message is sent from `SMTP_USER`; the visitor's address is set as `Reply-To`. This avoids Gmail rejecting or rewriting a message whose `From` address does not belong to the authenticated account.

#### GoDaddy Microsoft 365 SMTP settings

For a GoDaddy-hosted Microsoft 365 mailbox, configure the local `.env` or Vercel Production environment with:

- `SMTP_HOST`: `smtp.office365.com`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false` (STARTTLS)
- `SMTP_USER`: the complete GoDaddy mailbox address
- `SMTP_AUTH_METHOD`: `oauth2`
- `RECIPIENT`: the address that should receive contact messages

Security Defaults blocks password-based SMTP AUTH. OAuth2 requires an app registration in Microsoft Entra ID with the **Microsoft Graph** delegated `SMTP.Send` permission and a refresh token for `SMTP_USER`. Add these values to the environment:

- `MICROSOFT_TENANT_ID`: the tenant ID or verified tenant domain
- `SMTP_CLIENT_ID`: the Entra app registration's Application (client) ID
- `SMTP_CLIENT_SECRET`: the app secret value
- `SMTP_REFRESH_TOKEN`: a refresh token obtained through the OAuth authorization-code or device-code flow

The service uses the refresh token to obtain short-lived access tokens from the tenant token endpoint. Treat the client secret and refresh token as passwords; keep them in Vercel environment variables or another secret store, never in source control. Redeploy after changing variables.

For the Microsoft OAuth setup, register an app in **Microsoft Entra admin center**, add **Microsoft Graph > Delegated permissions > SMTP.Send** (displayed as **Send emails from mailboxes using SMTP AUTH**), request the `https://outlook.office.com/SMTP.Send` and `offline_access` scopes during authorization, and grant consent as required by the tenant. The `SMTP.Send` permission ID is `258f6531-6087-4cc4-bb90-092c5fb3ed3f`. The mailbox must also be permitted to use SMTP AUTH with OAuth. Microsoft documents the token and XOAUTH2 flow here: https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth

For legacy GoDaddy Essential Email (not Microsoft 365), keep `SMTP_AUTH_METHOD="password"` and use `smtpout.secureserver.net` with the mailbox password instead.

### CORS Setting

To allow frontend app to consume this email service, assign the HTTP domain in the environment variable, ALLOWED_FRONTEND_ORIGIN.

### Testing

```
curl --location --request POST 'https://{{YOUR_DOMAIN}}/contact-us' \
--header 'Content-Type: application/json' \
--data-raw '{
    "from": "somebody@someProvider.com",
    "firstName": "Jane",
    "lastName": "Ealing",
    "subject": "Customer Enquiry",
    "message": "Hey there, I want to understand what minimum quantity to have free delivery? Thanks",
    "countryCode": "UK",
    "mobileNumber": "07890123456"
}'
```
