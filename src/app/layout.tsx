import type { Metadata } from "next";
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

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Zubayer Hossain Uday | Full Stack Software Engineer",
    template: "%s | Zubayer Hossain Uday"
  },
  description: "Full Stack Software Engineer specializing in clean, performant web applications using Next.js, TypeScript, and Prisma.",
  openGraph: {
    title: "Zubayer Hossain Uday | Full Stack Software Engineer",
    description: "Full Stack Software Engineer specializing in clean, performant web applications using Next.js, TypeScript, and Prisma.",
    url: "https://uday.dev",
    siteName: "Zubayer Hossain Uday Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zubayer Hossain Uday | Full Stack Software Engineer",
    description: "Full Stack Software Engineer specializing in clean, performant web applications using Next.js, TypeScript, and Prisma.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </body>
    </html>
  );
}
