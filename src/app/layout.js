import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import siteData from "../data/site-data.json";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: siteData.seo.title || siteData.restaurant.name,
  description: siteData.seo.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
