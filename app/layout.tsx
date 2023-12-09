import type { Metadata } from "next";
import "@/app/globals.css";
import { merriweather } from "@/app/ui/fonts";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Take1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={merriweather.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
