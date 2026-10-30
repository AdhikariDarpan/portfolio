import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.darpanadhikari.com.np",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark-default"],
      styleOverrides: {
        borderRadius: "0.75rem",
        codeFontFamily: "var(--font-mono)",
      },
    }),
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: "directory",
  },
});
