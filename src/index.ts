import path from "path";
import { fs, util, type types } from "vortex-api";
import type {
  IBepInExGameConfig,
  INexusDownloadInfo,
} from "../node_modules/modtype-bepinex/src/types";

const GAME_ID = "taintedgrailthefallofavalon";
const STEAM_ID = "1466060";
const GOG_ID = "1887281589";
const GAME_DATA_DIR = "Fall of Avalon_Data";
const IL2CPP_DIR = path.join(GAME_DATA_DIR, "il2cpp_data");
const MANAGED_DLL_DIR = path.join(GAME_DATA_DIR, "Managed");
const GAME_EXE_FILENAME = "Fall of Avalon.exe";

const BEPINEX5_DOWNLOAD_INFO: INexusDownloadInfo = {
  gameId: GAME_ID,
  domainId: GAME_ID,
  modId: "50",
  fileId: "162",
  archiveName: "BepInEx Mono Windows x64-50-5-4-23-3-1752802821.zip",
  architecture: "x64",
  version: "5.4.23.3",
  allowAutoInstall: false,
};

const BEPINEX6_DOWNLOAD_INFO: INexusDownloadInfo = {
  gameId: GAME_ID,
  domainId: GAME_ID,
  modId: "16",
  fileId: "100",
  archiveName: "BepinEx-16-6-0-0-be-735b-1749459702.zip",
  architecture: "x64",
  version: "6.0.0-be+735b", // Semver compliant version https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  allowAutoInstall: false,
};

const enum InstallationType {
  Mono = "Mono (v5)",
  IL2CPP = "IL2CPP (v6)",
}

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

  const modPath = path.join("BepInEx", "plugins");

  context.registerGame({
    id: GAME_ID,
    name: "Tainted Grail: The Fall of Avalon",
    shortName: "TG:FoA",
    mergeMods: true,
    queryPath: () =>
      util.GameStoreHelper.findByAppId([STEAM_ID, GOG_ID]).then(
        (game) => game.gamePath,
      ),
    setup: (discovery) => fs.ensureDirAsync(path.join(discovery.path, modPath)),
    logo: "gameart.png",
    queryModPath: () => modPath,
    executable: () => GAME_EXE_FILENAME,
    requiredFiles: [GAME_EXE_FILENAME],
    environment: {
      SteamAPPId: STEAM_ID,
    },
    details: {
      steamAppId: STEAM_ID,
      gogAppId: GOG_ID,
    },
  });

  const bepInEx5Config: IBepInExGameConfig = {
    gameId: GAME_ID,
    autoDownloadBepInEx: true,
    unityBuild: "unitymono",
    customPackDownloader: () => Promise.resolve(BEPINEX5_DOWNLOAD_INFO),
  };
  const bepInEx6Config: IBepInExGameConfig = {
    gameId: GAME_ID,
    autoDownloadBepInEx: true,
    unityBuild: "unityil2cpp",
    customPackDownloader: () => Promise.resolve(BEPINEX6_DOWNLOAD_INFO),
  };

  context.once(async () => {
    if (context.api.ext.bepinexAddGame !== undefined) {
      const game = util.getGame(GAME_ID);
      const gamePath = await game.queryPath();
      const gameBuild = await checkGameBuild(gamePath);
      if (gameBuild === InstallationType.Mono) {
        console.log("Installing BepInEx 5 (Mono)");
        await context.api.ext.bepinexAddGame(bepInEx5Config);
      } else {
        console.log("Installing BepInEx 6 (IL2CPP)");
        await context.api.ext.bepinexAddGame(bepInEx6Config);
      }

      const bepInExBuild = await checkBepInExBuild(gamePath);
      if (bepInExBuild && bepInExBuild !== gameBuild) {
        console.warn(
          `Detected BepInEx build mismatch: expected ${gameBuild}, but got ${bepInExBuild}.`,
        );

        const t = context.api.translate;
        const replace = {
          game: game.name,
          gameBuild,
          bepInExBuild,
          bl: "[br][/br][br][/br]",
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
          [{ label: "Close", default: true }],
        );
      }
    }
  });
  return true;
}

export default main;
