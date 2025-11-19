import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ModernNavbar } from "../components/layout/ModernNavbar";
import { ModernFooter } from "../components/layout/ModernFooter";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Showra — Shareable GitHub Repo Cards",
  description:
    "Transform any GitHub repository into a futuristic, shareable project card with Showra.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[--background] text-[--text-primary]">
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0A0A0A]">
          <ModernNavbar />
          <main className="flex-1">{children}</main>
          <ModernFooter />
        </div>
      </body>
    </html>
  );
}
