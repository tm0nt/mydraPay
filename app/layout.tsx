import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import  prisma  from "@/lib/prisma"; 

const inter = Inter({ subsets: ["latin"] });

// Função assíncrona para gerar metadata dinamicamente do banco Prisma
export async function generateMetadata(): Promise<Metadata> {
  // Consulte o banco (ex: pegue o primeiro registro de SiteSettings)
  const settings = await prisma.globalConfig.findFirst();

  // Fallback para valores default se não houver dados
  const defaultTitle = "AURA Dashboard";
  const defaultDescription = "Professional financial dashboard with elegant design.";
  const defaultKeywords = "finanças, dashboard, AURA, SEO keywords";

  return {
    title: settings?.seoDefaultTitle || defaultTitle,
    description: settings?.seoDefaultDescription || defaultDescription,
    keywords: settings?.seoDefaultKeywords || defaultKeywords,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} dark bg-black text-foreground`}
        suppressHydrationWarning // Suprime mismatch causado por extensões
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            {children}
            <Toaster 
              theme="dark"
              position="top-right"
              richColors
              duration={5000}
            />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}