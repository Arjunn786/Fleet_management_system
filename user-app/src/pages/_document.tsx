import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <meta
          name="description"
          content="Fleet Management System - Manage your vehicle fleet efficiently"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-dark-950 text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
