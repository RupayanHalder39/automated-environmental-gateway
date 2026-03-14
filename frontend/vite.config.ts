import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const shimPath = (relativePath: string) =>
  new URL(relativePath, import.meta.url).pathname;

// Vite config for fast dev server and build output.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@radix-ui(.*)$/,
        replacement: `${shimPath("./src/shims/@radix-ui")}$1`,
      },
      {
        find: "class-variance-authority",
        replacement: shimPath("./src/shims/class-variance-authority.ts"),
      },
      { find: "clsx", replacement: shimPath("./src/shims/clsx.ts") },
      { find: "cmdk", replacement: shimPath("./src/shims/cmdk.tsx") },
      {
        find: "embla-carousel-react",
        replacement: shimPath("./src/shims/embla-carousel-react.tsx"),
      },
      { find: "input-otp", replacement: shimPath("./src/shims/input-otp.tsx") },
      { find: "next-themes", replacement: shimPath("./src/shims/next-themes.ts") },
      { find: "react-day-picker", replacement: shimPath("./src/shims/react-day-picker.tsx") },
      { find: "react-hook-form", replacement: shimPath("./src/shims/react-hook-form.ts") },
      {
        find: "react-resizable-panels",
        replacement: shimPath("./src/shims/react-resizable-panels.tsx"),
      },
      { find: "sonner", replacement: shimPath("./src/shims/sonner.tsx") },
      { find: "tailwind-merge", replacement: shimPath("./src/shims/tailwind-merge.ts") },
      { find: "vaul", replacement: shimPath("./src/shims/vaul.tsx") },
    ],
  },
});
