import { routes } from '@/config/routes';
import {
  PiSquaresFour,
  PiChartLineUp,
  PiUserGear,
  PiBellSimpleRinging,
  PiUser,
  PiEnvelopeSimpleOpen,
  PiFolders,
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
  {
    name: 'File Manager',
    href: '/',
    icon: <PiFolders />,
  },
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
    name: 'Widgets',
  },
  // label end
  {
    name: 'Cards',
    href: routes.widgets.cards,
    icon: <PiSquaresFour />,
  },
  {
    name: 'Charts',
    href: routes.widgets.charts,
    icon: <PiChartLineUp />,
  },
  // label start
  {
    name: 'Forms',
  },
  // label end
  {
    name: 'Account Settings',
    href: routes.forms.profileSettings,
    icon: <PiUserGear />,
  },
  {
    name: 'Notification Preference',
    href: routes.forms.notificationPreference,
    icon: <PiBellSimpleRinging />,
  },
  {
    name: 'Personal Information',
    href: routes.forms.personalInformation,
    icon: <PiUser />,
  },
  {
    name: 'Newsletter',
    href: routes.forms.newsletter,
    icon: <PiEnvelopeSimpleOpen />,
  }
];
