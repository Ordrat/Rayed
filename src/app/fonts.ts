import { Inter, Lexend_Deca, Cairo } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-lexend',
});

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '600', '700'],
});
