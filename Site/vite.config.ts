import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "build",
    // Warn earlier than the 500 kB default — screens are code-split, so any
    // chunk above this means something leaked into the wrong bundle.
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Pin React only. Everything else is left to Rollup, which places a
          // dependency in the route chunk that needs it — a blanket "vendor"
          // chunk would drag route-only libraries (react-hook-form, floating-ui)
          // into the initial download.
          return /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
            ? "react"
            : undefined;
        },
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
});
