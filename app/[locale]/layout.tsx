import type { Metadata } from "next";
import "./globals.css";
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import {NextIntlClientProvider, useMessages} from 'next-intl';
import { unstable_setRequestLocale } from "next-intl/server";
import { Toaster as Sonner } from "@/components/ui/sonner"
const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "My Awesome PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};
const locales = ['en', 'de'];
 
export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}
interface RootLayoutProps {
  children: React.ReactNode;
  params: {locale: string};
}
const RootLayout: React.FC<RootLayoutProps> = ({ children,  params: {locale} }) => {
  unstable_setRequestLocale(locale);
  const messages=useMessages()

  return (
    <html lang={locale}>
      <body className={cn("min-h-screen bg-background font-sans antialiased",fontSans.variable)}>  
    
      <NextIntlClientProvider locale={locale} messages={messages}>


           <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange>
          {children}
          <Toaster />
          <Sonner/>
          </ThemeProvider>
</NextIntlClientProvider>   
    </body>
          
    </html>
  );
}
export default RootLayout