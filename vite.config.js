import { defineConfig } from "vite";

export default defineConfig({
  define:{
    global:"window"
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,

    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "unhydrolized-hardheartedly-jan.ngrok-free.dev"
    ]
  }
});
