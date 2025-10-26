import "~/styles/globals.css";

import type { Metadata } from "next";

import { ToastProvider } from "~/components/toast-provider";

export const metadata: Metadata = {
  title: "Daniël Terwiel - Developer",
  description:
    "An accomplished developer with a focus on the web, architecture, performance, accessibility",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Daniël Terwiel - Developer",
    description:
      "An accomplished developer with a focus on the web, architecture, performance, accessibility",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans selection:bg-klein selection:text-white print:max-w-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
