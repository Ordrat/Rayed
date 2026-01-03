# Admin Seller Account Creation - Exploration & Planning

**Date**: 2026-01-03
**Status**: Exploration Complete - Ready for Implementation Planning
**Quota Status**: Paused - Resume after quota refresh

---

## Project Goal

Implement an admin dashboard feature that allows admin users to:
1. Log in with an admin account
2. Access seller account creation functionality (visible only to admins)
3. Create new seller accounts via the dashboard
4. Test the flow by logging out and logging in as the newly created seller

**Key Requirements**:
- Admin-only feature (role-based access)
- Uses existing monorepo shared/reusable components
- Follows existing codebase patterns
- Full frontend implementation

---

## Exploration Summary

### 1. Authentication System Analysis

**Current Implementation**:
- **Location**: `src/auth.ts`, `src/services/auth.service.ts`, `src/types/auth.types.ts`
- **Strategy**: NextAuth with JWT-based sessions
- **Existing Flow**: Seller login only (`POST /api/Auth/SellerLogin`)

**Session Structure**:
```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: string[];  // ← Important for role-based access
    shopId: string;
    sellerStatus: number;  // 0=NEEDS_RESET, 1=ACTIVE, 2=SUSPENDED, 3=PENDING
  };
  accessToken: string;
  refreshToken: string;
  needsPasswordReset: boolean;
}
```

**Authentication Flow**:
1. User logs in → `POST /api/Auth/SellerLogin`
2. If `sellerStatus === 0` → Auto-redirect to password reset
3. Password reset → `POST /api/Auth/ResetPassword`
4. Logout → `POST /api/Auth/Logout`

**Key Files**:
- Sign-in form: `src/app/[locale]/auth/(sign-in)/sign-in-1/sign-in-form.tsx`
- Reset password: `src/app/[locale]/auth/(forgot-password)/forgot-password-1/forget-password-form.tsx`
- Profile menu (logout): `src/layouts/profile-menu.tsx`
- Middleware: `src/middleware.ts` (protects all routes except auth pages)

**Role System**:
- Session stores `roles: string[]` array
- Constants defined in: `src/config/constants.ts`
- **Currently NOT enforced** - no conditional rendering or route protection based on roles

---

### 2. Admin Dashboard Structure

**Layout System**:
- Main layout: `src/app/[locale]/(hydrogen)/layout.tsx`
- Dashboard home: `src/app/[locale]/(hydrogen)/page.tsx`
- Menu items: `src/layouts/hydrogen/menu-items.tsx`

**Current Menu**:
- File Manager (home)
- Widgets (Cards, Charts)
- Forms (Account Settings, Notifications, Personal Info, Newsletter)

**Missing Features**:
- No admin login flow (only seller login)
- No user/seller management pages
- No role management UI
- No support staff management UI
- Route `/roles-permissions` defined in config but not implemented

**Routes Config**: `src/config/routes.ts`

---

### 3. Seller Registration API Status

**CRITICAL FINDING**: No seller registration endpoint found in codebase!

**Available API Endpoints** (from `src/app/api/Apis.txt`):
- `POST /api/Auth/SellerLogin` ✓ Implemented
- `POST /api/Auth/ResetPassword` ✓ Implemented
- `POST /api/Auth/Logout` ✓ Implemented
- `POST /api/Support/RegisterSupport` ✓ Available (NOT in frontend yet)

**Support Registration Pattern** (Reference for implementation):
```typescript
// POST /api/Support/RegisterSupport
{
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  department: number;
  canCloseTickets: boolean;
  canIssueRefunds: boolean;
  canBanUsers: boolean;
  canViewAllTickets: boolean;
}
```

**Other Support APIs Available**:
- `PUT /api/Support/UpdateSupport`
- `GET /api/Support/GetAll`
- `GET /api/Support/GetById/{id}`
- `POST /api/Support/ChangeStatus/change-status`

**API Client**:
- Location: `src/lib/api-client.ts`
- Base URL: `https://api.rayed.app`
- Headers: `X-Api-Version: 1.0`, `Accept-Language: en`
- Uses bearer token authentication

**Documentation**:
- `SUPPORT_SELLER_ONBOARDING.md` - Comprehensive onboarding guide
- `AUTH_IMPLEMENTATION.md` - Technical implementation details

---

### 4. Monorepo & Component Structure

**Workspace Structure**:
- Main app: `isomorphic-intl` (Next.js 15, port 3001)
- Core package: `packages/isomorphic-core` (shared components)
- Uses pnpm workspaces + Turborepo

**Tech Stack**:
- Next.js 15 + App Router
- React 19
- TypeScript 5.8
- React Hook Form 7.54 + Zod validation
- RizzUI component library v1.0.1
- NextAuth
- next-intl (i18n)

**Shared Component Locations**:
- **Core UI**: `packages/isomorphic-core/src/ui/`
- **Core Components**: `packages/isomorphic-core/src/components/`
- **App Shared**: `src/app/shared/`

**Available Form Components**:

From RizzUI (`import from 'rizzui'`):
- Input, Password, Select, Checkbox, Button, Switch, Radio, Textarea

Custom Components:
- **Form**: `packages/isomorphic-core/src/ui/form.tsx`
  - React Hook Form + Zod integration
  - Server error handling
  - TypeScript generics

- **PhoneInput**: `packages/isomorphic-core/src/ui/phone-input.tsx`
  - Uses `react-phone-input-2`
  - Validation, clearable, searchable

- **FormFooter**: `packages/isomorphic-core/src/components/form-footer.tsx`
  - Sticky footer with submit/cancel

- **FormGroup**: `src/app/shared/form-group.tsx`
  - Grid layout for form sections

**Modal System**:
- Hook: `packages/isomorphic-core/src/modal-views/use-modal.ts`
- Container: `packages/isomorphic-core/src/modal-views/modal.tsx`
- Button: `src/app/shared/modal-button.tsx`

```typescript
const { openModal, closeModal } = useModal();

openModal({
  view: <YourComponent />,
  customSize: 500,
  size: 'md'
});
```

---

### 5. Form Patterns & Validation

**Validation Schemas Location**: `src/validators/`

**Relevant Schemas**:
- `create-user.schema.ts` - User creation (fullName, email, role, permissions, status)
- `signup.schema.ts` - Sign up form (firstName, lastName, email, password, confirmPassword)
- `team-member.schema.ts` - Team member addition
- `login.schema.ts` - Login (emailOrPhone, password)
- `reset-password.schema.ts` - Password reset
- `common-rules.ts` - Reusable rules (validateEmail, validatePassword, validateConfirmPassword)

**Common Form Pattern**:
```typescript
export default function SellerRegistrationForm() {
  const { closeModal } = useModal();
  const [isLoading, setLoading] = useState(false);
  const t = useTranslations("form");

  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true);
    // API call
    toast.success("Success message");
    closeModal();
    setLoading(false);
  };

  return (
    <Form<Schema>
      validationSchema={schema(t)}
      onSubmit={onSubmit}
    >
      {({ register, control, formState: { errors } }) => (
        /* Form fields */
      )}
    </Form>
  );
}
```

**Reference Examples**:
- Sign up: `src/app/[locale]/auth/(sign-up)/sign-up-1/sign-up-form.tsx`
- Add team member modal: `src/app/shared/account-settings/modal/add-team-member.tsx`

---

## Key Decisions Needed Before Implementation

### Question 1: Seller Registration API Endpoint
The Support API exists (`POST /api/Support/RegisterSupport`) but NO seller registration endpoint was found.

**Options**:
- A) Assume `/api/Seller/RegisterSeller` exists (not documented yet)
- B) Use the Support API endpoint instead
- C) Verify backend API documentation first

### Question 2: Admin Login Flow
Currently only seller login exists.

**Options**:
- A) Same login + role check (Admin logs in via SellerLogin, check roles in session) ← **Recommended**
- B) Create separate admin login page
- C) Admin is just a seller with elevated permissions

### Question 3: UI Placement
Where to add seller creation feature?

**Options**:
- A) New "User Management" menu section ← **Recommended**
- B) Add to existing menu section
- C) Modal button on dashboard home

---

## Implementation Plan Outline (To Be Finalized)

### Phase 1: Role-Based Access Control
1. Add role checking utilities
2. Create `RequireRole` component wrapper
3. Update navigation to conditionally show admin features

### Phase 2: Seller Registration API Service
1. Create seller registration types
2. Implement API service function
3. Create validation schema

### Phase 3: Seller Creation Form
1. Build form component with modal
2. Add phone input, password generation
3. Implement submit handler with error handling

### Phase 4: Admin Dashboard Integration
1. Add "User Management" menu item (admin-only)
2. Create seller list page
3. Add "Create Seller" button/modal

### Phase 5: Testing Flow
1. Verify admin login and menu visibility
2. Test seller creation
3. Test logout and seller login
4. Verify password reset flow

---

## Files That Will Be Created/Modified

**New Files** (estimated):
- `src/services/seller.service.ts` - Seller API calls
- `src/validators/create-seller.schema.ts` - Validation
- `src/app/shared/admin/create-seller-modal.tsx` - Form component
- `src/app/[locale]/(hydrogen)/admin/sellers/page.tsx` - Seller management page
- `src/utils/role-check.ts` - Role utilities
- `src/components/require-role.tsx` - Auth wrapper

**Modified Files** (estimated):
- `src/layouts/hydrogen/menu-items.tsx` - Add admin menu
- `src/config/routes.ts` - Add admin routes
- `src/types/auth.types.ts` - Add seller registration types

---

## Next Steps After Quota Refresh

1. **Clarify the 3 key questions above** with user
2. **Launch Plan agent** to design detailed implementation based on answers
3. **Write final plan** to plan file
4. **Get user approval** and begin implementation

---

## Important Notes

- **Existing admin account**: User confirmed they have an admin account
- **No backend work needed**: Focus is frontend implementation only
- **Monorepo context**: Use shared components from `packages/isomorphic-core`
- **Internationalization**: Use `useTranslations()` for all text
- **Pattern consistency**: Follow existing form/modal patterns

---

**Exploration Completed By**: Claude Sonnet 4.5
**Agent IDs for Resuming**:
- Authentication/Admin exploration: `a6b2083`
- API exploration: `aba3b74`
- Monorepo/Components exploration: `a56f57e`
