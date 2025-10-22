import { Providers } from "@/components/Providers";
import "@/styles/index.scss";
export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Liff App</title>
      </head>
      <body suppressHydrationWarning>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}
