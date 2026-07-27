import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nexseat.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "NexSeat — Split the cost of AI tools with your group",
    template: "%s · NexSeat",
  },
  description:
    "Join a group and split the monthly cost of ChatGPT Plus, Claude Pro, Gemini Advanced, and more — only where each provider's terms allow shared seats.",
  keywords: ["AI subscriptions", "split cost", "ChatGPT Plus group", "Claude Pro shared", "SaaS"],
  openGraph: {
    title: "NexSeat — Split the cost of AI tools with your group",
    description: "Pool seats on AI subscriptions with people you trust, transparently and safely.",
    url: appUrl,
    siteName: "NexSeat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexSeat",
    description: "Split the cost of AI tool subscriptions with a group.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
