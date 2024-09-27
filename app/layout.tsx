import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/components/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inkbound",
  description: "Elevate Your Game: Your Journey to College Athletics Starts Here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Remove bg-background if unnecessary */}
      <body className={cn(inter.className)}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
