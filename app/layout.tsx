import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Portfolio — UI/UX Designer",
    template: "%s | Portfolio",
  },
  description:
    "UI/UX Designer & Front-End Developer. Crafting intuitive digital experiences.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-neutral-950 text-neutral-100 min-h-screen flex flex-col">
        <Suspense>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
