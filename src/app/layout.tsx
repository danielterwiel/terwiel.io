import "~/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Daniël Terwiel - Developer",
  description:
    "An accomplished developer with a focus on the web, architecture, performance, accessibility",
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
      <head>
        <link
          rel="icon"
          href="/images/favicon.png?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>

      <body
        className={` font-sans selection:bg-klein selection:text-white print:max-w-full ${inter.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
