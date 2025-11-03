import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    manifest: "/manifest.json",
    themeColor: "#000000",
    metadataBase: new URL(minikitConfig.miniapp.homeUrl as string),
    alternates: {
      canonical: minikitConfig.miniapp.homeUrl as string,
    },
    openGraph: {
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      url: minikitConfig.miniapp.homeUrl as string,
      siteName: minikitConfig.miniapp.name,
      type: "website",
      images: [
        {
          url: minikitConfig.miniapp.heroImageUrl as string,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
      images: [minikitConfig.miniapp.heroImageUrl as string],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: minikitConfig.miniapp.name,
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>{children}</SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
