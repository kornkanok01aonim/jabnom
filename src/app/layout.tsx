import type { Metadata } from 'next';
import { Inter, Outfit, Kanit } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-primary',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-heading',
  display: 'swap',
});

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '700'],
  variable: '--font-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jabnom.com'),
  title: 'JABNOM | แหล่งรวมสาวสวย ดารา นางแบบ โอนลี่แฟนส์',
  description: 'เว็บไซต์ที่รวบรวมรูปภาพและเรื่องราวของสาวสวย ดารา นางแบบ เน็ตไอดอล และโอนลี่แฟนส์ ที่คุณไม่ควรพลาด',
  keywords: ['สาวสวย', 'ดารา', 'นางแบบ', 'เน็ตไอดอล', 'โอนลี่แฟนส์', 'jabnom'],
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${kanit.variable}`}>
      <body>
        {children}
        <Script 
          src="https://www.tiktok.com/embed.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}
