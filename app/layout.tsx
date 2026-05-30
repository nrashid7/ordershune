import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://ordershune.com"),
  title: {
    default: "OrderShune — Turn customer messages into courier-ready orders",
    template: "%s | OrderShune",
  },
  description:
    "AI WhatsApp-first courier assistant for Bangladeshi Facebook, WhatsApp, and Instagram sellers.",
  openGraph: {
    title: "OrderShune — Turn customer messages into courier-ready orders",
    description:
      "AI WhatsApp-first courier assistant for Bangladeshi Facebook, WhatsApp, and Instagram sellers.",
    type: "website",
    locale: "en_US",
    siteName: "OrderShune",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrderShune",
    description:
      "Turn messy customer messages into courier-ready orders for Bangladeshi sellers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
