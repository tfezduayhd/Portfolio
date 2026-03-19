import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoBackground from "@/components/VideoBackground";
import { Analytics } from "@vercel/analytics/next";

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
      <body className="font-sans bg-[#0a0a0f] text-neutral-100 min-h-screen flex flex-col antialiased">
        <VideoBackground src="/background.mp4" overlayOpacity={0.55} />
        <Suspense>
          <Header />
        </Suspense>
        <main className="flex-1 relative">{children}</main>
        <Suspense>
          <Footer />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
