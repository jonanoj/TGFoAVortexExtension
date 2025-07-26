import path from "path";
import { fs, util, type types } from "vortex-api";
import type { IBepInExGameConfig } from "../node_modules/modtype-bepinex/src/types";
import {
  BEPINEX5_DOWNLOAD_INFO,
  BEPINEX6_DOWNLOAD_INFO,
  GAME,
  IL2CPP_DIR,
  MANAGED_DLL_DIR,
} from "./consts";
import { showMonoMigrationReminder } from "./migration";
import { settingsReducer } from "./reducers";
import { InstallationType } from "./types";

async function doesDirectoryExist(dir: string): Promise<boolean> {
  try {
    const stat = await fs.statSilentAsync(dir);
    return stat && stat.isDirectory();
  } catch {
    return false;
  }
}

async function checkGameBuild(gamePath: string): Promise<InstallationType> {
  console.debug("Looking for Mono dir");
  if (await doesDirectoryExist(path.join(gamePath, MANAGED_DLL_DIR))) {
    console.debug("Found Mono dir");
    const monoDlls = (
      await fs.readdirAsync(path.join(gamePath, MANAGED_DLL_DIR))
    ).filter((f: string) => f.startsWith("Mono.") && f.endsWith(".dll"));
    if (monoDlls.length > 0) {
      console.debug("Found Mono DLLs:", monoDlls);
      return InstallationType.Mono;
    }
  }

  console.debug("Looking for IL2CPP dir");
  if (await doesDirectoryExist(path.join(gamePath, IL2CPP_DIR))) {
    console.debug("Found IL2CPP dir");
    const il2CppDat = await fs.readdirAsync(path.join(gamePath, IL2CPP_DIR));
    if (il2CppDat.length > 0) {
      console.debug("Found IL2CPP dirs:", il2CppDat);
      return InstallationType.IL2CPP;
    }
  }

  throw new Error(
    `Couldn't find "${MANAGED_DLL_DIR}" or "${IL2CPP_DIR}" under the game folder, is the game installed correctly?`,
  );
}

async function checkBepInExBuild(
  gamePath: string,
): Promise<InstallationType | undefined> {
  const bepInExPath = path.join(gamePath, "BepInEx", "core");
  if (await doesDirectoryExist(bepInExPath)) {
    console.debug("Found BepInEx/core directory");

    const coreDlls = await fs.readdirAsync(bepInExPath);
    if (
      coreDlls.some(
        (file: string) =>
          file.toLowerCase().includes("il2cpp") && file.endsWith(".dll"),
      )
    ) {
      console.debug("Found IL2CPP BepInEx DLLs:", coreDlls);
      return InstallationType.IL2CPP;
    }
    console.debug("IL2CPP BepInEx DLLs not found, assuming Mono is installed");
    return InstallationType.Mono;
  }
  return undefined;
}

function main(context: types.IExtensionContext): boolean {
  context.requireExtension("modtype-bepinex");
  context.registerReducer(["settings", GAME.id], settingsReducer);
  context.registerGame(GAME);

  const bepInEx5Config: IBepInExGameConfig = {
    gameId: GAME.id,
    autoDownloadBepInEx: true,
    unityBuild: "unitymono",
    customPackDownloader: () => Promise.resolve(BEPINEX5_DOWNLOAD_INFO),
  };
  const bepInEx6Config: IBepInExGameConfig = {
    gameId: GAME.id,
    autoDownloadBepInEx: true,
    unityBuild: "unityil2cpp",
    customPackDownloader: () => Promise.resolve(BEPINEX6_DOWNLOAD_INFO),
  };

  context.once(async () => {
    if (context.api.ext.bepinexAddGame !== undefined) {
      const gamePath = await GAME.queryPath();
      const gameStore = await util.GameStoreHelper.identifyStore(gamePath);
      const gameBuild = await checkGameBuild(gamePath);

      console.log(`Game Store: ${gameStore}, Game Build: ${gameBuild}`);

      if (gameBuild === InstallationType.Mono) {
        console.log("Using BepInEx 5 (Mono)");
        await context.api.ext.bepinexAddGame(bepInEx5Config);
      } else {
        console.log("Using BepInEx 6 (IL2CPP)");
        await context.api.ext.bepinexAddGame(bepInEx6Config);

        if (gameStore === util.steam.id) {
          // Mono version is currently only available on Steam
          showMonoMigrationReminder(context);
        }
      }

      const bepInExBuild = await checkBepInExBuild(gamePath);
      if (bepInExBuild && bepInExBuild !== gameBuild) {
        console.warn(
          `Detected BepInEx build mismatch: expected ${gameBuild}, but got ${bepInExBuild}.`,
        );

        const t = context.api.translate;
        const replace = {
          game: GAME.name,
          gameBuild,
          bepInExBuild,
          bl: "[br][/br]",
        };

        context.api.showDialog(
          "error",
          "BepInEx Version Mismatch",
          {
            bbcode: t(
              '"{{game}}" is currently installed with the "{{gameBuild}}" game build,{{bl}}' +
                "but the currently installed BepInEx version is for the {{bepInExBuild}} build.{{bl}}" +
                "Please go to the Mods tab and install the correct BepInEx version for your game build.",
              { replace },
            ),
          },
          [{ label: t("Close"), default: true }],
        );
      }
    }
  });
  return true;
}

export default main;
