import { Lusitana, Merriweather, MedievalSharp } from "next/font/google";

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const medievalSharp = MedievalSharp({
  subsets: ["latin"],
  weight: ["400"],
});
