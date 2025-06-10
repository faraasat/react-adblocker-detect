import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "default",
  },
  plugins: [resolve(), commonjs(), babel({ babelHelpers: "bundled" })],
  external: ["react", "react-dom"],
};
