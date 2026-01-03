# Support Guide: Seller Onboarding

## Overview
This guide explains how support staff should onboard new sellers to the platform.

## Prerequisites
- Access to the support dashboard or admin panel
- Permission to create seller accounts
- Ability to generate reset tokens

## Steps to Onboard a New Seller

### 1. Create Seller Account

Use the backend API to create a new seller account:

**Endpoint:** `POST /api/Support/RegisterSupport` (or equivalent seller registration endpoint)

**Required Information:**
- First Name
- Last Name
- Email Address
- Phone Number
- Temporary Password
- Shop/Store details (if applicable)

### 2. Generate Reset Token

After creating the account, you must generate a reset token for the seller. This token is required for the seller to set their permanent password on first login.

**Important:** The seller's `sellerStatus` should be set to `0` (NEEDS_PASSWORD_RESET) when creating the account.

### 3. Provide Credentials to Seller

Send the following information to the seller via secure channel (email, SMS, or in person):

```
Welcome to [Platform Name]!

Your seller account has been created. Please follow these steps to access your account:

1. Visit: [Your App URL]/auth/sign-in-1

2. Login Credentials:
   Email/Phone: [seller's email or phone]
   Temporary Password: [temporary password]

3. First Time Setup:
   After logging in, you will be asked to reset your password.
   Reset Token: [reset token]

4. Create a strong password that includes:
   - At least 8 characters
   - Mix of uppercase and lowercase letters
   - Numbers and special characters

If you need assistance, please contact support at [support email/phone].

Best regards,
Support Team
```

## Credentials Template

Use this template when sending credentials:

```
═══════════════════════════════════════
SELLER ACCOUNT CREDENTIALS
═══════════════════════════════════════

Login URL: [App URL]/auth/sign-in-1

Email/Phone: ___________________
Password: ___________________
Reset Token: ___________________

IMPORTANT:
- You will be asked to reset your password on first login
- Keep your reset token safe - you'll need it
- Change your password immediately after first login

═══════════════════════════════════════
```

## What Happens Next

### Seller's First Login Flow:

1. **Login Page**
   - Seller enters email/phone and temporary password
   - Clicks "Sign in"

2. **Auto-Redirect to Reset Password**
   - System detects first-time login
   - Automatically redirects to reset password page
   - Email/phone is pre-filled

3. **Reset Password**
   - Seller enters the reset token
   - Creates new password
   - Confirms new password
   - Clicks "Reset Password"

4. **Dashboard Access**
   - Password is updated
   - Seller is redirected to dashboard
   - Full access granted

## Troubleshooting

### Seller Can't Login
- Verify credentials are correct
- Check account is active (`isActive: true`)
- Confirm `sellerStatus` is set to `0` for first login

### Reset Password Fails
- Verify reset token is valid and not expired
- Ensure reset token matches the one provided
- Check password meets complexity requirements

### Seller Locked Out
- Check if account is suspended
- Verify email/phone number is correct
- Generate new reset token if needed

## Support Checklist

Before sending credentials to seller, verify:

- [ ] Account created successfully
- [ ] `sellerStatus` set to `0` (NEEDS_PASSWORD_RESET)
- [ ] Account is active (`isActive: true`)
- [ ] Email address is valid
- [ ] Phone number is valid (if using phone login)
- [ ] Reset token generated and saved
- [ ] Temporary password is secure
- [ ] Shop/store details are correct
- [ ] Credentials sent via secure channel

## Security Best Practices

1. **Password Security**
   - Generate strong temporary passwords
   - Never reuse passwords
   - Don't send passwords via unsecured channels

2. **Reset Token Security**
   - Generate unique tokens for each seller
   - Tokens should expire after use
   - Store tokens securely in backend

3. **Communication**
   - Use encrypted email when possible
   - Consider two-step delivery (password via email, token via SMS)
   - Verify seller identity before account creation

## API Reference for Support

### Create Seller Account
```bash
POST /api/Support/RegisterSupport
Headers:
  X-Api-Version: 1.0
  Accept-Language: en
  Authorization: Bearer {support_token}

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "email": "john.doe@example.com",
  "password": "TempPass123!",
  "department": 0,
  "canCloseTickets": true,
  "canIssueRefunds": true,
  "canBanUsers": false,
  "canViewAllTickets": true
}
```

## Need Help?

Contact the development team if you encounter:
- Technical errors during account creation
- System not redirecting properly
- API errors or failures
- Questions about the onboarding process

---

**Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** Development Team
