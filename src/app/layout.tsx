import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PWARegistration } from "./components/PWARegistration";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WashMaster Pro - Sistema de Gestión de Autolavado",
  description: "Dashboard operativo premium para la administración de autolavados y servicios estéticos automotrices.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CarWash Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark preload ${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <ThemeProvider>
            <PWARegistration />
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}

