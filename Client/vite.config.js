import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "maskable_icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ],
      manifest: {
        name: "LoCanjeamos",
        short_name: "LoCanjeamos",
        description: "Cambiá lo que tenés por algo que querés!",
        theme_color: "#ffe66d",
        background_color: "#ffe66d",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/maskable_icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Agregar",
            description: "Agrega un producto",
            url: "/#/addProduct",
            icons: [{ src: "add.png", sizes: "192x192" }],
          },
          {
            name: "Mi perfil",
            description: "Tu perfil",
            url: "/#/login",
            icons: [{ src: "user.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.google-analytics\.com\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "google-analytics",
            },
          },
        ],
      },
      // Esta línea activa GA para modo offline (opcional)
      enableGoogleAnalytics: true,
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000000,
  },
});
