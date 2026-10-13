import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled locally (from @fontsource) so renders work offline.
const FACES: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Bebas Neue", file: "bebas-neue-latin-400-normal", weight: "400" },
  { family: "Playfair Display", file: "playfair-display-latin-400-normal", weight: "400" },
  { family: "Playfair Display", file: "playfair-display-latin-700-normal", weight: "700" },
  { family: "Playfair Display", file: "playfair-display-latin-400-italic", weight: "400", style: "italic" },
  { family: "Montserrat", file: "montserrat-latin-400-normal", weight: "400" },
  { family: "Montserrat", file: "montserrat-latin-600-normal", weight: "600" },
  { family: "Montserrat", file: "montserrat-latin-800-normal", weight: "800" },
  { family: "Caveat", file: "caveat-latin-400-normal", weight: "400" },
  { family: "Caveat", file: "caveat-latin-700-normal", weight: "700" },
];

let loading: Promise<unknown> | null = null;
export const fontsReady = () => {
  if (!loading) {
    loading = Promise.all(
      FACES.map((f) =>
        loadFont({
          family: f.family,
          url: staticFile(`dome/fonts/${f.file}.woff2`),
          weight: f.weight,
          style: f.style ?? "normal",
        }),
      ),
    );
  }
  return loading;
};
fontsReady();

export const FONTS = {
  display: "'Bebas Neue', sans-serif",
  serif: "'Playfair Display', serif",
  sans: "Montserrat, sans-serif",
  hand: "Caveat, cursive",
};

export const BRAND = {
  night: "#0d0f14",
  lava: "#ff5a1f",
  ember: "#ffb347",
  cream: "#f6efe3",
  stone: "#2a2d34",
};

export const FPS = 30;
