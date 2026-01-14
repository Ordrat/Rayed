import { routes } from '@/config/routes';
import {
  PiUser,
  PiEnvelopeSimpleOpen,
  PiHeadset,
  PiCar,
  PiStorefront,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'sidebar-menu-overview',
  },
  // label end
  // label start
  {
    name: 'sidebar-menu-admin',
  },
  // label end
  {
    name: 'sidebar-menu-support-agents',
    href: routes.support.agents,
    icon: <PiHeadset />,
  },
  {
    name: 'sidebar-menu-drivers',
    href: routes.drivers.list,
    icon: <PiCar />,
  },
  {
    name: 'sidebar-menu-sellers',
    href: routes.sellers.list,
    icon: <PiStorefront />,
  },

  // label start
  {
    name: 'sidebar-menu-forms',
  },
  // label end
  {
    name: 'sidebar-menu-profile',
    href: routes.profile,
    icon: <PiUser />,
  },
  {
    name: 'sidebar-menu-newsletter',
    href: routes.forms.newsletter,
    icon: <PiEnvelopeSimpleOpen />,
  },
];
