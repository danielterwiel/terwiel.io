import "~/styles/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daniël Terwiel - Developer",
  description: "An accomplished developer with 18 years of experience.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Daniël Terwiel - Developer",
    description: "An accomplishe developer with 18 years of experience.",
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
        {children}
      </body>
    </html>
  );
}
