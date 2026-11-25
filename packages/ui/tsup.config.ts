import { defineConfig } from "tsup";

export default defineConfig({
  entry: { "react/index": "src/react/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  banner: { js: '"use client";' },
});
