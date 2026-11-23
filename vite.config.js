import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import searchHandler from "./api/search.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "BRAVE_SEARCH_API_KEY");
  if (env.BRAVE_SEARCH_API_KEY) {
    process.env.BRAVE_SEARCH_API_KEY = env.BRAVE_SEARCH_API_KEY;
  }

  return {
    plugins: [
      react(),
      {
        name: "local-web-search-api",
        configureServer(server) {
          server.middlewares.use("/api/search", (request, response, next) => {
            searchHandler(request, response).catch(next);
          });
        },
      },
    ],
  };
});
