import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/io-buyback-portal/",
  plugins: [react()],
});
