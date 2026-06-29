import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetPath = path.join(__dirname, "assets");
const destPath = path.join(__dirname, "dist");

async function start() {
  try {
    const assets = await fs.readdir(assetPath);
    for (const asset of assets) {
      try {
        await fs.copyFile(
          path.join(assetPath, asset),
          path.join(destPath, asset),
        );
      } catch (err) {
        console.error("Error copying asset", { asset, err });
      }
    }
  } catch (err) {
    console.error("Failed to copy assets!", err);
  }
}

await start();
