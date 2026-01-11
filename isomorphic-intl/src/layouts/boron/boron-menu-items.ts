import {
  PiFoldersDuotone,
  PiHeadsetDuotone,
  PiCarDuotone,
  PiStorefrontDuotone,
  PiUserGearDuotone,
  PiShoppingBagDuotone,
  PiGridFourDuotone,
  PiListDashesDuotone,
  PiPackageDuotone,
  PiTicketDuotone,
  PiChatCircleDotsDuotone,
} from 'react-icons/pi';
import { routes } from '@/config/routes';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'sidebar-menu-overview',
  },
  // label end
  {
    name: 'sidebar-menu-file-manager',
    href: '/',
    icon: PiFoldersDuotone,
    shortcut: {
      modifiers: 'alt',
      key: '1',
    },
  },

  // label start
  {
    name: 'sidebar-menu-admin',
  },
  // label end
  {
    name: 'sidebar-menu-support-agents',
    href: routes.support.agents,
    icon: PiHeadsetDuotone,
  },
  {
    name: 'sidebar-menu-support-tickets',
    href: routes.support.tickets,
    icon: PiTicketDuotone,
  },
  {
    name: 'sidebar-menu-drivers',
    href: routes.drivers.list,
    icon: PiCarDuotone,
  },
  {
    name: 'sidebar-menu-sellers',
    href: routes.sellers.list,
    icon: PiStorefrontDuotone,
  },
  {
    name: 'sidebar-menu-shop',
    icon: PiShoppingBagDuotone,
    dropdownItems: [
      {
        name: 'sidebar-menu-shop-hub',
        href: routes.shop.hub,
      },
      {
        name: 'sidebar-menu-shop-categories',
        href: routes.shop.categories,
      },
      {
        name: 'sidebar-menu-shop-sub-categories',
        href: routes.shop.subCategories,
      },
    ],
  },
  {
    name: 'sidebar-menu-products',
    href: routes.products.list,
    icon: PiPackageDuotone,
  },

  // label start
  {
    name: 'sidebar-menu-support-dashboard',
  },
  // label end
  {
    name: 'sidebar-menu-my-tickets',
    href: routes.supportDashboard.tickets,
    icon: PiChatCircleDotsDuotone,
  },

  // label start
  {
    name: 'sidebar-menu-settings',
  },
  // label end
  {
    name: 'sidebar-menu-account-settings',
    href: routes.forms.profileSettings,
    icon: PiUserGearDuotone,
  },
];
