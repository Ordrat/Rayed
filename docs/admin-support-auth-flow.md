# Admin & Support Authentication Flow Documentation

This document explains the complete authentication flow for Admin and Support accounts in the Rayed application.

## Overview

The system implements a role-based authentication flow where:
1. **Admin** users can log in and manage support agents
2. **Support** agents are created by admins and must reset their password on first login
3. After password reset, support agents access their own dashboard

## API Endpoints Used

All API calls are made to `https://api.rayed.app`

### Authentication
- **POST** `/api/Auth/SellerLogin` - Login for both Admin and Support users
- **POST** `/api/Auth/ResetPassword` - Reset password (required for first-time login)
- **POST** `/api/Auth/Logout` - Logout

### Support Management (Admin only)
- **POST** `/api/Support/RegisterSupport` - Create a new support agent
- **PUT** `/api/Support/UpdateSupport` - Update existing support agent
- **GET** `/api/Support/GetAll` - Get all support agents
- **GET** `/api/Support/GetById/{id}` - Get support agent by ID
- **POST** `/api/Support/ChangeStatus/change-status` - Change agent status

## Files Created/Modified

### Types
- `src/types/support.types.ts` - TypeScript interfaces for support data
  - `SupportDepartment` enum (General, Technical, Billing, Sales)
  - `SupportStatus` enum (Offline, Online, Busy, Away)
  - `RegisterSupportRequest`, `UpdateSupportRequest`, `SupportAgent` interfaces

### Services
- `src/services/support.service.ts` - API calls for support management
  - `registerSupport()` - Create new support agent
  - `updateSupport()` - Update existing agent
  - `getAllSupport()` - Get all agents
  - `getSupportById()` - Get single agent
  - `changeSupportStatus()` - Update agent status
  - `isSupportAgent()` - Check if user has support role
  - `isAdmin()` - Check if user has admin role

### Validators
- `src/validators/support.schema.ts` - Zod validation schemas
  - `registerSupportSchema` - Validation for creating agents
  - `updateSupportSchema` - Validation for updating agents

### Routes Configuration
- `src/config/routes.ts` - Added new routes:
  - `routes.support.agents` - `/admin/support-agents`
  - `routes.support.createAgent` - `/admin/support-agents/create`
  - `routes.support.editAgent(id)` - `/admin/support-agents/{id}/edit`
  - `routes.support.agentDetails(id)` - `/admin/support-agents/{id}`
  - `routes.supportDashboard.home` - `/support-dashboard`

### Pages (Admin - Support Agent Management)
- `src/app/[locale]/(hydrogen)/admin/support-agents/page.tsx` - List all support agents
- `src/app/[locale]/(hydrogen)/admin/support-agents/create/page.tsx` - Create new agent
- `src/app/[locale]/(hydrogen)/admin/support-agents/[id]/page.tsx` - View agent details
- `src/app/[locale]/(hydrogen)/admin/support-agents/[id]/edit/page.tsx` - Edit agent

### Shared Components
- `src/app/shared/admin/support-agents/support-agents-page.tsx` - Agent listing with cards
- `src/app/shared/admin/support-agents/create-support-agent-page.tsx` - Create form
- `src/app/shared/admin/support-agents/support-agent-details-page.tsx` - Details view
- `src/app/shared/admin/support-agents/edit-support-agent-page.tsx` - Edit form

### Support Dashboard (for Support Agents)
- `src/app/[locale]/(hydrogen)/support-dashboard/page.tsx` - Support dashboard home
- `src/app/shared/support-dashboard/support-dashboard-page.tsx` - Blank placeholder dashboard

### Modified Files
- `src/layouts/hydrogen/menu-items.tsx` - Added "Admin" section with "Support Agents" menu item
- `src/app/[locale]/auth/(sign-in)/sign-in-1/sign-in-form.tsx` - Role-based redirect after login
- `messages/en.json` - Added translation keys for new menu items

## Authentication Flow

### 1. Admin Login
```
User enters credentials
    → POST /api/Auth/SellerLogin
    → Check sellerStatus (0 = needs reset, 1 = active)
    → If status 0: Redirect to reset password
    → If status 1: Check roles
        → If admin role: Redirect to "/" (main dashboard)
        → If support role: Redirect to "/support-dashboard"
```

### 2. Admin Creates Support Agent
```
Admin navigates to /admin/support-agents
    → GET /api/Support/GetAll (view existing agents)
Admin clicks "Add Support Agent"
    → Fills form with agent details
    → POST /api/Support/RegisterSupport
    → Agent created with initial password
```

### 3. Support Agent First Login
```
Support agent enters credentials
    → POST /api/Auth/SellerLogin
    → sellerStatus = 0 (needs password reset)
    → Redirect to /auth/forgot-password-1
```

### 4. Support Agent Resets Password
```
Support agent on reset password page
    → Enters reset token and new password
    → POST /api/Auth/ResetPassword
    → Session updated with new tokens
    → sellerStatus updated to 1
    → Redirect to /support-dashboard
```

### 5. Support Agent Normal Login (after reset)
```
Support agent enters credentials
    → POST /api/Auth/SellerLogin
    → sellerStatus = 1 (active)
    → roles includes "support"
    → Redirect to /support-dashboard
```

## Role Checking Logic

The `isSupportAgent()` function checks if user roles include:
- "support"
- "supportagent"

The `isAdmin()` function checks if user roles include:
- "admin"
- "administrator"
- "owner"

## Support Dashboard (Coming Soon)

The support dashboard is currently a placeholder with:
- Welcome message with agent's name
- "Coming Soon" section for future features
- Placeholder stat cards (Open Tickets, Resolved Today, etc.)

Future features will be implemented in the next phase.

## Testing the Flow

1. **Login as Admin**: Use admin credentials to access the main dashboard
2. **Navigate to Support Agents**: Use sidebar menu "Admin" → "Support Agents"
3. **Create Agent**: Click "Add Support Agent" and fill the form
4. **Test Agent Login**: Use the agent's email and initial password
5. **Reset Password**: The agent should be redirected to reset password
6. **Access Dashboard**: After reset, agent should see support dashboard

## Error Handling

All API calls include proper error handling with toast notifications:
- Invalid credentials: Shows "Invalid credentials" error
- Network errors: Shows "Network error occurred"
- Permission denied: Redirects to home with error message
- Not found: Redirects back to list with error message

## Security Notes

- JWT tokens are stored in session (not localStorage)
- All API calls require Bearer token in Authorization header
- Role checks are performed both client-side and server-side
- Password reset token is required for password changes
