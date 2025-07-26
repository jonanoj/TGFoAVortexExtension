import { INexusDownloadInfo } from "modtype-bepinex/src/types";
import path from "path";
import { fs, util } from "vortex-api";
import { IGame } from "vortex-api/lib/types/api";

export const STEAM_ID = "1466060";
export const GOG_ID = "1887281589";
export const GAME_DATA_DIR = "Fall of Avalon_Data";
export const IL2CPP_DIR = path.join(GAME_DATA_DIR, "il2cpp_data");
export const MANAGED_DLL_DIR = path.join(GAME_DATA_DIR, "Managed");
export const GAME_EXE_FILENAME = "Fall of Avalon.exe";
export const MOD_PATH = path.join("BepInEx", "plugins");

export const GAME: IGame = {
  id: "taintedgrailthefallofavalon",
  name: "Tainted Grail: The Fall of Avalon",
  shortName: "TG:FoA",
  mergeMods: true,
  queryPath: () =>
    util.GameStoreHelper.findByAppId([STEAM_ID, GOG_ID]).then(
      (game) => game.gamePath,
    ),
  setup: (discovery) => fs.ensureDirAsync(path.join(discovery.path, MOD_PATH)),
  logo: "gameart.png",
  queryModPath: () => MOD_PATH,
  executable: () => GAME_EXE_FILENAME,
  requiredFiles: [GAME_EXE_FILENAME],
  environment: {
    SteamAPPId: STEAM_ID,
  },
  details: {
    steamAppId: STEAM_ID,
    gogAppId: GOG_ID,
  },
};

export const BEPINEX5_DOWNLOAD_INFO: INexusDownloadInfo = {
  gameId: GAME.id,
  domainId: GAME.id,
  modId: "50",
  fileId: "162",
  archiveName: "BepInEx Mono Windows x64-50-5-4-23-3-1752802821.zip",
  architecture: "x64",
  version: "5.4.23.3",
  allowAutoInstall: false,
};

export const BEPINEX6_DOWNLOAD_INFO: INexusDownloadInfo = {
  gameId: GAME.id,
  domainId: GAME.id,
  modId: "16",
  fileId: "100",
  archiveName: "BepinEx-16-6-0-0-be-735b-1749459702.zip",
  architecture: "x64",
  version: "6.0.0-be+735b", // Semver compliant version https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  allowAutoInstall: false,
};
