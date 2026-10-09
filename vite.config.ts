import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // `npm run dev` serves the site; run `npm start` in a second terminal if you need /api/contact locally.
    proxy: { "/api": "http://localhost:3000" },
  },
});
