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

export const metadata = {
  metadataBase: new URL("https://sistema-multitarea.vercel.app"),
  title: {
    default: "Sistema Multitarea",
    template: "%s | Sistema Multitarea",
  },
  description: "Hub inteligente y multitarea con herramientas integradas de productividad.",
  applicationName: "Multitareas App",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Multitareas",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo_app1.png",
    shortcut: "/logo_app1.png",
    apple: "/logo_app1.png",
  },
  openGraph: {
    title: "Sistema Multitarea",
    description: "Hub inteligente y multitarea con herramientas integradas de productividad.",
    url: "https://sistema-multitarea.vercel.app",
    siteName: "Sistema Multitarea",
    images: [
      {
        url: "/logo_app1.png",
        width: 512,
        height: 512,
        alt: "Logo Sistema Multitarea",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema Multitarea",
    description: "Hub inteligente y multitarea con herramientas integradas de productividad.",
    images: ["/logo_app1.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans antialiased bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}

