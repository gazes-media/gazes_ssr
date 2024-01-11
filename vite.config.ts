import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks:undefined,
            },
        },
    },
    start: {
        server: {
          prerender: {
            routes: ["/", "/about"]
          }
        }
      }    
});
