import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  target: "es2019",
  external: ["react", "react-dom"],

  // Single-entry library: code splitting produces shared chunks that the
  // `banner` below cannot reach, which is how the "use client" directive
  // used to get lost. Keeping it off makes the directive reliable.
  splitting: false,

  // Libraries ship readable code — the consuming app's bundler minifies.
  minify: false,

  // Sourcemaps are deliberately not published: they were ~65% of the install
  // footprint, and this build is already readable.
  sourcemap: false,

  shims: false,
  // NOTE: do not enable tsup's `treeshake`. It runs an extra rollup pass
  // after esbuild that strips this banner, silently shipping a client
  // component without its directive. esbuild already tree-shakes the bundle.
  banner: { js: '"use client";' },
});
