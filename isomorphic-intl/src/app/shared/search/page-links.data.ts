import { routes } from "@/config/routes";
import { DUMMY_ID } from "@/config/constants";

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  // label start
  {
    name: "Home",
  },
  // label end
  {
    name: "Support",
    href: routes.support.dashboard,
  },
  // label start
  {
    name: "Admin",
  },
  // label end
  {
    name: "Support Agents",
    href: routes.support.agents,
  },
  {
    name: "Support Tickets",
    href: routes.support.tickets,
  },
  {
    name: "Drivers",
    href: routes.drivers.list,
  },
  {
    name: "Create Driver",
    href: routes.drivers.create,
  },
  {
    name: "Sellers",
    href: routes.sellers.list,
  },
  {
    name: "Create Seller",
    href: routes.sellers.create,
  },
  {
    name: "Products",
    href: routes.products.list,
  },
  {
    name: "Shop Hub",
    href: routes.shop.hub,
  },
  {
    name: "Categories",
    href: routes.shop.categories,
  },
  {
    name: "Create Category",
    href: routes.shop.createCategory,
  },
  {
    name: "Sub Categories",
    href: routes.shop.subCategories,
  },
  {
    name: "Create Sub Category",
    href: routes.shop.createSubCategory,
  },
  // label start
  {
    name: "Support Dashboard",
  },
  // label end
  {
    name: "My Tickets",
    href: routes.supportDashboard.tickets,
  },
  // label start
  {
    name: "Widgets",
  },
  // label end
  {
    name: "Cards",
    href: routes.widgets.cards,
  },
  {
    name: "Charts",
    href: routes.widgets.charts,
  },
  // label start
  {
    name: "Forms",
  },
  // label end
  {
    name: "Profile",
    href: routes.profile,
  },
  {
    name: "Newsletter",
    href: routes.forms.newsletter,
  },
  // label start
  {
    name: "Authentication",
  },
  // label end
  {
    name: "Sign Up",
    href: routes.auth.signUp,
  },
  {
    name: "Sign In",
    href: routes.auth.signIn,
  },
  {
    name: "Forgot Password",
    href: routes.auth.forgotPassword,
  },
  {
    name: "OTP Page",
    href: routes.auth.otp,
  },
  {
    name: "Set Password",
    href: routes.auth.setPassword,
  },
];
