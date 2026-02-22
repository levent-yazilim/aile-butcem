import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'bulut.today | Güneş Döngüsü',
  description: 'Gündüz süresini ve güneşin hareketlerini anlık takip edin.',
  icons: {
    icon: '/favicon.ico', // Tarayıcı sekmesi için
    apple: '/apple-touch-icon.png', // iPhone ana ekranı için
  },
  manifest: '/manifest.json', // Uygulama gibi davranması için

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
