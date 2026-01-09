import { routes } from '@/config/routes';
import { IconType } from 'react-icons/lib';
import {
  PiBellSimpleRingingDuotone,
  PiBrowserDuotone,
  PiChartLineUpDuotone,
  PiEnvelopeSimpleOpenDuotone,
  PiFoldersDuotone,
  PiNotePencilDuotone,
  PiPackageDuotone,
  PiSquaresFourDuotone,
  PiUserCircleDuotone,
  PiUserGearDuotone,
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
    menuItems: [
      {
        name: 'sidebar-menu-file-manager',
        href: '/',
        icon: PiFoldersDuotone,
      },
    ],
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
    id: '4',
    name: 'sidebar-menu-widgets',
    title: 'sidebar-menu-widgets',
    icon: PiPackageDuotone,
    menuItems: [
      {
        name: 'sidebar-menu-cards',
        href: routes.widgets.cards,
        icon: PiSquaresFourDuotone,
      },
      {
        name: 'sidebar-menu-charts',
        href: routes.widgets.charts,
        icon: PiChartLineUpDuotone,
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
        name: 'sidebar-menu-account-settings',
        href: routes.forms.profileSettings,
        icon: PiUserGearDuotone,
      },
      {
        name: 'sidebar-menu-notification-preference',
        href: routes.forms.notificationPreference,
        icon: PiBellSimpleRingingDuotone,
        badge: '',
      },
      {
        name: 'sidebar-menu-personal-information',
        href: routes.forms.personalInformation,
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
