import {
  PiFoldersDuotone,
  PiHeadsetDuotone,
  PiCarDuotone,
  PiStorefrontDuotone,
  PiUserGearDuotone,
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
    name: 'sidebar-menu-drivers',
    href: routes.drivers.list,
    icon: PiCarDuotone,
  },
  {
    name: 'sidebar-menu-sellers',
    href: routes.sellers.list,
    icon: PiStorefrontDuotone,
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
