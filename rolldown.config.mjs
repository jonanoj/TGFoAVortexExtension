import { defineConfig } from "rolldown";
import { builtinModules } from "node:module";
import { readFileSync } from "node:fs";
const { peerDependencies } = JSON.parse(
  readFileSync(new URL("./node_modules/vortex-api/package.json", import.meta.url), "utf-8")
);
function getExternals() {
  const builtins = builtinModules.filter((m) => !m.startsWith("_"));
  return [
    ...new Set([
      ...builtins,
      ...Object.keys(peerDependencies || {}),
      "electron",
      "vortex-api",
    ]),
  ];
}
export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
    exports: "auto",
  },
  external: [...getExternals(), "modtype-bepinex"],
  platform: "node",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    tsconfigFilename: "tsconfig.json",
  },
  plugins: [
    // Add custom plugins as needed (e.g., for native addons, asset copying)
  ],
});
