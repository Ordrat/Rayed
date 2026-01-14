import { routes } from '@/config/routes';
import { IconType } from 'react-icons/lib';
import {
  PiEnvelopeSimpleOpen,
  PiHouse,
  PiNotePencil,
  PiUser,
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

export const berylliumMenuItems: MenuItemsType[] = [
  {
    id: '1',
    name: 'sidebar-menu-home',
    title: 'sidebar-menu-overview',
    icon: PiHouse,
    menuItems: [],
  },
  {
    id: '5',
    name: 'sidebar-menu-forms',
    title: 'sidebar-menu-forms',
    icon: PiNotePencil,
    menuItems: [
      {
        name: 'sidebar-menu-profile',
        href: routes.profile,
        icon: PiUser,
      },
      {
        name: 'sidebar-menu-newsletter',
        href: routes.forms.newsletter,
        icon: PiEnvelopeSimpleOpen,
      },
    ],
  },
];
export const berylliumMenuItemAtom = atom(berylliumMenuItems[0]);
