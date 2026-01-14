import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';

export type SubMenuItemType = {
  name: string;
  href: string;
};

export type DropdownItemType = {
  name: string;
  icon: string;
  description?: string;
  href?: string;
  subMenuItems?: SubMenuItemType[];
};

export type LithiumMenuItem = {
  [key: string]: {
    name: string;
    type: string;
    dropdownItems: DropdownItemType[];
  };
};

export const lithiumMenuItems: LithiumMenuItem = {
  overview: {
    name: 'sidebar-menu-overview',
    type: 'link',
    dropdownItems: [],
  },
  admin: {
    name: 'sidebar-menu-admin',
    type: 'link',
    dropdownItems: [
      {
        name: 'sidebar-menu-support-agents',
        href: routes.support.agents,
        icon: 'PiHeadsetDuotone',
      },
      {
        name: 'sidebar-menu-drivers',
        href: routes.drivers.list,
        icon: 'PiCarDuotone',
      },
      {
        name: 'sidebar-menu-sellers',
        href: routes.sellers.list,
        icon: 'PiStorefrontDuotone',
      },
    ],
  },
  forms: {
    name: 'sidebar-menu-forms',
    type: 'link',
    dropdownItems: [
      {
        name: 'sidebar-menu-profile',
        href: routes.profile,
        icon: 'UserSettingsIcon',
      },
      {
        name: 'sidebar-menu-newsletter',
        href: routes.forms.newsletter,
        icon: 'NewsletterAnnouncement',
      },
    ],
  },
};

export type LithiumMenuItemsKeys = keyof typeof lithiumMenuItems;
