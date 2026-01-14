import { routes } from '@/config/routes';
import {
  PiUser,
  PiEnvelopeSimpleOpen,
  PiHeadset,
  PiCar,
  PiStorefront,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems = [
  // label start
  {
    name: 'Overview',
  },
  // label end
  // label start
  {
    name: 'Admin',
  },
  // label end
  {
    name: 'Support Agents',
    href: routes.support.agents,
    icon: <PiHeadset />,
  },
  {
    name: 'Drivers',
    href: routes.drivers.list,
    icon: <PiCar />,
  },
  {
    name: 'Sellers',
    href: routes.sellers.list,
    icon: <PiStorefront />,
  },
  // label start
  {
    name: 'Forms',
  },
  // label end
  {
    name: 'Profile',
    href: routes.profile,
    icon: <PiUser />,
  },
  {
    name: 'Newsletter',
    href: routes.forms.newsletter,
    icon: <PiEnvelopeSimpleOpen />,
  }
];
