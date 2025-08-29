import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { UserPolling } from "@/components/user-polling"; // polling global
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

// --- Helpers --------------------------------------------------------------
async function getGlobalConfig() {
  return prisma.globalConfig.findFirst({
    select: {
      siteName: true,
      siteUrl: true,
      siteLogoUrl: true,
      faviconUrl: true,
      seoDefaultTitle: true,
      seoDefaultDescription: true,
      seoDefaultKeywords: true,
    },
  });
}

// --- Metadata -------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalConfig();

  const defaultTitle = "AURA Dashboard";
  const defaultDescription = "Professional financial dashboard with elegant design.";
  const defaultKeywords = "finanças, dashboard, AURA, SEO keywords";

  const keywords = (settings?.seoDefaultKeywords?.length
    ? settings.seoDefaultKeywords
    : defaultKeywords
  )
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const title = settings?.seoDefaultTitle || defaultTitle;
  const description = settings?.seoDefaultDescription || defaultDescription;
  const siteName = settings?.siteName || "AURA";
  const siteUrl = settings?.siteUrl || "https://example.com";
  const logo = settings?.siteLogoUrl || undefined;
  const favicon = settings?.faviconUrl || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      siteName,
      url: siteUrl,
      images: logo ? [{ url: logo }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: logo ? [logo] : undefined,
    },
    icons: favicon ? { icon: [{ url: favicon }] } : undefined,
    applicationName: siteName,
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
  };
}

// --- Root layout ----------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} dark bg-black text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Zustand polling global (client component) */}
          <UserPolling />

          {children}

          {/* Notificações */}
          <Toaster theme="dark" position="top-right" richColors duration={5000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
