# Email Confirmation Setup Instructions

## Backend Configuration

### 1. Update Environment Variables

Edit your `backend/.env` file and add the following email configuration:

```env
# Email Configuration (Required for email confirmation)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail App Password Setup

Since we're using Gmail for sending emails, you need to create an "App Password":

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to "Security" → "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password (without spaces) as `EMAIL_PASS`

**Important:** Never use your regular Gmail password. Always use an App Password.

### 3. Test the Setup

1. Start your backend server: `cd backend && npm start`
2. Register a new user with a valid @gmail.com email
3. Check your email for the confirmation link
4. Click the link to confirm your email
5. Try logging in with the confirmed account

## How It Works

1. **Registration**: User registers → Email sent with confirmation link → Account created but marked as unconfirmed
2. **Email Confirmation**: User clicks link → Account activated → Can now login
3. **Login**: Only confirmed users can log in

## Security Features

- Confirmation tokens expire after 24 hours
- Tokens are cryptographically secure (32-byte random)
- Users can re-register to get a new confirmation email
- Invalid/expired tokens show appropriate error messages

## Troubleshooting

- **Emails not sending**: Check your Gmail credentials and app password
- **Confirmation link not working**: Verify FRONTEND_URL matches your frontend URL
- **Token expired**: Users can register again to get a new confirmation email