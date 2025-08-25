import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext"; // Importe o provider aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AURA Dashboard",
  description: "Professional financial dashboard with elegant design.",
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark bg-black text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider> {/* Envolva aqui! */}
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
