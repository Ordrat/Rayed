import { routes } from '@/config/routes';
import { IconType } from 'react-icons/lib';
import {
  PiBrowserDuotone,
  PiEnvelopeSimpleOpenDuotone,
  PiNotePencilDuotone,
  PiUserCircleDuotone,
  PiHeadsetDuotone,
  PiCarDuotone,
  PiStorefrontDuotone,
} from 'react-icons/pi';
import { atom } from 'jotai';

export interface SubMenuItemType {
  name: string;
  description?: string;
  href: string;
  badge?: string;
}

export interface ItemType {
  name: string;
  icon: IconType;
  href?: string;
  description?: string;
  badge?: string;
  subMenuItems?: SubMenuItemType[];
}

export interface MenuItemsType {
  id: string;
  name: string;
  title: string;
  icon: IconType;
  menuItems: ItemType[];
}

export const carbonMenuItems: MenuItemsType[] = [
  {
    id: '1',
    name: 'sidebar-menu-dashboard',
    title: 'sidebar-menu-overview',
    icon: PiBrowserDuotone,
    menuItems: [],
  },
  {
    id: '2',
    name: 'sidebar-menu-admin',
    title: 'sidebar-menu-admin',
    icon: PiHeadsetDuotone,
    menuItems: [
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
    ],
  },
  {
    id: '5',
    name: 'sidebar-menu-forms',
    title: 'sidebar-menu-forms',
    icon: PiNotePencilDuotone,
    menuItems: [
      {
        name: 'sidebar-menu-profile',
        href: routes.profile,
        icon: PiUserCircleDuotone,
      },
      {
        name: 'sidebar-menu-newsletter',
        href: routes.forms.newsletter,
        icon: PiEnvelopeSimpleOpenDuotone,
      },
    ],
  },
];

export const carbonMenuItemAtom = atom(carbonMenuItems[0]);
