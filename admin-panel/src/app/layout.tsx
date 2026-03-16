import type { Metadata } from "next";
import { DM_Mono, Inter, Mona_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';

const dmMono = Mona_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Admin Panel - Company Management System",
  description: "Comprehensive admin panel for managing operations, employees, orders, and finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmMono.className} antialiased font-mono`}
      >
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
