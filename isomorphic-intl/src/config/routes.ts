export const routes = {
  support: {
    dashboard: "/support",
    inbox: "/support/inbox",
    supportCategory: (category: string) => `/support/inbox/${category}`,
    messageDetails: (id: string) => `/support/inbox/${id}`,
    snippets: "/support/snippets",
    createSnippet: "/support/snippets/create",
    viewSnippet: (id: string) => `/support/snippets/${id}`,
    editSnippet: (id: string) => `/support/snippets/${id}/edit`,
    templates: "/support/templates",
    createTemplate: "/support/templates/create",
    viewTemplate: (id: string) => `/support/templates/${id}`,
    editTemplate: (id: string) => `/support/templates/${id}/edit`,
    // Support agent management (for admin)
    agents: "/admin/support-agents",
    createAgent: "/admin/support-agents/create",
    editAgent: (id: string) => `/admin/support-agents/${id}/edit`,
    agentDetails: (id: string) => `/admin/support-agents/${id}`,
    // Support tickets management (for admin)
    tickets: "/admin/support-tickets",
    ticketDetails: (id: string) => `/admin/support-tickets/${id}`,
  },
  // Support agent dashboard (for logged in support agents)
  supportDashboard: {
    home: "/support-dashboard",
    tickets: "/support-dashboard/tickets",
    chat: (ticketId: string) => `/support-dashboard/chat/${ticketId}`,
    profile: "/support-dashboard/profile",
  },
  // Driver management (admin)
  drivers: {
    list: "/admin/drivers",
    create: "/admin/drivers/create",
    details: (id: string) => `/admin/drivers/${id}`,
    edit: (id: string) => `/admin/drivers/${id}/edit`,
  },
  // Seller management (admin)
  sellers: {
    list: "/admin/sellers",
    create: "/admin/sellers/create",
    details: (id: string) => `/admin/sellers/${id}`,
    edit: (id: string) => `/admin/sellers/${id}/edit`,
  },
  // Product management (admin)
  products: {
    list: "/admin/products",
    details: (id: string) => `/admin/products/${id}`,
  },
  // Branch management (admin)
  branches: {
    list: "/admin/branches",
    details: (id: string) => `/admin/branches/${id}`,
  },
  // Shop management (admin)
  shop: {
    hub: "/admin/shop/hub",
    categories: "/admin/shop/categories",
    createCategory: "/admin/shop/categories/create",
    categoryDetails: (id: string) => `/admin/shop/categories/${id}`,
    editCategory: (id: string) => `/admin/shop/categories/${id}/edit`,
    subCategories: "/admin/shop/sub-categories",
    createSubCategory: "/admin/shop/sub-categories/create",
    subCategoryDetails: (id: string) => `/admin/shop/sub-categories/${id}`,
    editSubCategory: (id: string) => `/admin/shop/sub-categories/${id}/edit`,
  },
  widgets: {
    cards: "/widgets/cards",
    icons: "/widgets/icons",
    charts: "/widgets/charts",
    maps: "/widgets/maps",
    banners: "/widgets/banners",
  },
  forms: {
    newsletter: "/forms/newsletter",
  },
  profile: "/profile",
  auth: {
    signUp: "/auth/sign-up",
    signIn: "/auth/sign-in",
    forgotPassword: "/auth/forgot-password",
    verifyAccount: "/auth/verify-account",
    setPassword: "/auth/set-password",
  },
  signIn: "/auth/signin",
};
