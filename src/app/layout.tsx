import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'JABNOM | แหล่งรวมสาวสวย ดารา นางแบบ โอนลี่แฟนส์',
  description: 'เว็บไซต์ที่รวบรวมรูปภาพและเรื่องราวของสาวสวย ดารา นางแบบ เน็ตไอดอล และโอนลี่แฟนส์ ที่คุณไม่ควรพลาด',
  keywords: ['สาวสวย', 'ดารา', 'นางแบบ', 'เน็ตไอดอล', 'โอนลี่แฟนส์', 'jabnom'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
