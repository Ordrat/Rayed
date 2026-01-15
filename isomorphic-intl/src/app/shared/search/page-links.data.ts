import { routes } from "@/config/routes";

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  // label start
  {
    name: "Overview",
  },
  // label end
  {
    name: "Dashboard",
    href: "/",
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
    name: "Sellers",
    href: routes.sellers.list,
  },
  {
    name: "Branches",
    href: routes.branches.list,
  },
  {
    name: "Products",
    href: routes.products.list,
  },
  // label start
  {
    name: "Shop",
  },
  // label end
  {
    name: "Shop Hub",
    href: routes.shop.hub,
  },
  {
    name: "Categories",
    href: routes.shop.categories,
  },
  {
    name: "Sub Categories",
    href: routes.shop.subCategories,
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
    name: "Settings",
  },
  // label end
  {
    name: "Profile",
    href: routes.profile,
  },
];
