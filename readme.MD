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
    "phoneNumber": "07890123456"
}'
```
