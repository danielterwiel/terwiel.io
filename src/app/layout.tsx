import "~/styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Daniël Terwiel - Developer",
  description:
    "An accomplished developer with a focus on the web, architecture, performance, accessibility",
  visualViewport: {
    name: "theme-color",
    content: "#d9723f",
  },
  openGraph: {
    type: "website",
    title: "Daniël Terwiel - Developer",
    description:
      "An accomplished developer with a focus on the web, architecture, performance, accessibility",
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
