import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Distributor Panel - Factory Orders & Transactions",
  description: "Distributor management system for ordering products and tracking transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased text-base title-regular`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
