// Font lokal (OFL), sama dengan yang dipakai Core dan landing page. Tanpa CDN.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const muatFont = () =>
  Promise.all([
    loadFont({
      family: "Saira Stencil One",
      url: staticFile("fonts/saira-stencil-one-latin-400-normal.woff2"),
      weight: "400",
    }),
    loadFont({
      family: "Saira Condensed",
      url: staticFile("fonts/saira-condensed-latin-400-normal.woff2"),
      weight: "400",
    }),
    loadFont({
      family: "Saira Condensed",
      url: staticFile("fonts/saira-condensed-latin-600-normal.woff2"),
      weight: "600",
    }),
    loadFont({
      family: "Saira Condensed",
      url: staticFile("fonts/saira-condensed-latin-700-normal.woff2"),
      weight: "700",
    }),
    loadFont({
      family: "Fira Code",
      url: staticFile("fonts/fira-code-latin-400-normal.woff2"),
      weight: "400",
    }),
  ]);
