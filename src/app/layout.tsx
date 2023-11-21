import "~/styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Terwiel - Freelance Developer",
  description:
    "An accomplished developer with a focus on the web, architecture, performance, accessibility",
  visualViewport: {
    name: "theme-color",
    content: "#d9723f",
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

      <body className={`prose font-sans ${inter.variable}`}>{children}</body>
    </html>
  );
}
