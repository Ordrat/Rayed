import { Metadata } from 'next';
import logoImg from '@public/logo/rayed.png';
import { LAYOUT_OPTIONS } from '@/config/enums';
import logoIconImg from '@public/logo/R.png';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'RAYED - Admin Dashboard',
  description: `RAYED the ultimate React TypeScript Admin Template. Streamline your admin dashboard development with our feature-rich, responsive, and highly customizable solution. Boost productivity and create stunning admin interfaces effortlessly.`,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.BORON,
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  return {
    title: title ? `${title} - Rayed` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - Rayed` : siteConfig.title,
      description,
      url: baseUrl,
      siteName: 'Rayed', // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: `${baseUrl}/logo/OG-Rayed.jpg`,
        width: 1200,
        height: 630,
      },
      locale: 'en_US',
      type: 'website',
    },
  };
};
