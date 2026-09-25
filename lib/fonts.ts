import { Jost, Playfair_Display, Inter } from "next/font/google";

export const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jost",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-playfair",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
