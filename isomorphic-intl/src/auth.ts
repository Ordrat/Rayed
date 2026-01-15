import { AuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { sellerLogin } from "@/services/auth.service";
import { SellerLoginResponse, SellerStatus } from "@/types/auth.types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      roles: string[];
      shopId: string;
      needsPasswordReset: boolean;
      sellerStatus: number;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpiration: string;
    error?: string;
  }

  interface User extends SellerLoginResponse {
    needsPasswordReset: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: string[];
    shopId: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
    needsPasswordReset: boolean;
    sellerStatus: number;
    error?: string;
  }
}

const auth: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        const sellerUser = user as User;
        token.id = sellerUser.id!;
        token.email = sellerUser.email!;
        token.firstName = sellerUser.firstName;
        token.lastName = sellerUser.lastName;
        token.phoneNumber = sellerUser.phoneNumber;
        token.roles = sellerUser.roles;
        token.shopId = sellerUser.shopId;
        token.accessToken = sellerUser.accessToken;
        token.refreshToken = sellerUser.refreshToken;
        token.accessTokenExpiration = sellerUser.accessTokenExpirationDate;
        token.refreshTokenExpiration = sellerUser.refreshTokenExpirationDate;
        token.needsPasswordReset = sellerUser.needsPasswordReset;
        token.sellerStatus = sellerUser.sellerStatus;
      }

      // Update session when password is reset
      if (trigger === "update" && session) {
        token.needsPasswordReset = false;
        token.accessToken = session.accessToken;
        token.refreshToken = session.refreshToken;
        token.accessTokenExpiration = session.accessTokenExpiration;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: `${token.firstName} ${token.lastName}`,
        firstName: token.firstName,
        lastName: token.lastName,
        phoneNumber: token.phoneNumber,
        roles: token.roles,
        shopId: token.shopId,
        needsPasswordReset: token.needsPasswordReset,
        sellerStatus: token.sellerStatus,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpiration = token.accessTokenExpiration;
      session.error = token.error;

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow callback URLs on the same origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrPhone: {
          label: "Email or Phone",
          type: "text"
        },
        password: {
          label: "Password",
          type: "password"
        },
        // Token-based auth (for OTP verification flow)
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        accessTokenExpiration: { label: "Access Token Expiration", type: "text" },
        refreshTokenExpiration: { label: "Refresh Token Expiration", type: "text" },
        email: { label: "Email", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" },
        roles: { label: "Roles", type: "text" },
        id: { label: "ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          // Token-based authentication (OTP verification flow)
          if (credentials?.accessToken) {
            return {
              id: credentials.id!,
              email: credentials.email!,
              firstName: credentials.firstName!,
              lastName: credentials.lastName!,
              phoneNumber: credentials.phoneNumber!,
              emailConfirmed: true,
              isActive: true,
              roles: JSON.parse(credentials.roles || "[]"),
              shopId: "",
              accessToken: credentials.accessToken,
              accessTokenExpirationDate: credentials.accessTokenExpiration!,
              refreshToken: credentials.refreshToken!,
              refreshTokenExpirationDate: credentials.refreshTokenExpiration!,
              needsPasswordReset: false,
              sellerStatus: SellerStatus.ACTIVE,
            } as User;
          }

          // Password-based authentication (normal login flow)
          if (!credentials?.emailOrPhone || !credentials?.password) {
            throw new Error("Email/Phone and password are required");
          }

          const response = await sellerLogin({
            emailOrPhone: credentials.emailOrPhone,
            password: credentials.password,
          });

          // Block login for pending accounts (status 0)
          if (response.sellerStatus === SellerStatus.PENDING) {
            throw new Error("ACCOUNT_PENDING_APPROVAL");
          }

          // Block login for suspended accounts (status 2)
          if (response.sellerStatus === SellerStatus.SUSPENDED) {
            throw new Error("ACCOUNT_SUSPENDED");
          }

          return {
            ...response,
            needsPasswordReset: false,
          } as User;
        } catch (error: any) {
          console.error("Login error:", error);

          // Return null to show error on login page
          throw new Error(error.message || "Invalid credentials");
        }
      },
    }),
  ],
};

export default auth;
