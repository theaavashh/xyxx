import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-manrope",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-poppins",
  subsets: ["latin"],
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
        className={`${manrope.variable} ${poppins.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
