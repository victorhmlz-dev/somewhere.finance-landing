import { Nunito_Sans } from "next/font/google";
import "./globals.css";

// Fuente única del proyecto (Google Fonts, variable: todos los pesos en un
// solo archivo). Se expone como --font-nunito-sans; styles/tokens.css hace
// que --font-sans y --font-mono apunten a ella.
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata = {
  title: "somewhere",
  description:
    "A generative universe of NFT collections, chain ecosystems and NonFungible Financial Collectibles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body>{children}</body>
    </html>
  );
}
