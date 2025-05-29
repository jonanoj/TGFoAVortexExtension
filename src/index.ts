import path from 'path';
import { fs, util, type types } from 'vortex-api';
import type { IBepInExGameConfig, INexusDownloadInfo } from '../node_modules/modtype-bepinex/src/types';

const GAME_ID = 'taintedgrailthefallofavalon'
const STEAM_ID = '1466060'
const GOG_ID = '1887281589'
const GAME_EXE_FILENAME = 'Fall of Avalon.exe';

const BEPINEX_DOWNLOAD_INFO: INexusDownloadInfo = {
    gameId: GAME_ID,
    domainId: GAME_ID,
    modId: '16',
    fileId: '52',
    archiveName: 'BepinEx-16-6-0-0-be-735-1748475694.zip',
    architecture: 'x64',
    version: '6.0.0-be+735', // Semver compliant version
    allowAutoInstall: true,
}

function main(context: types.IExtensionContext): boolean {
    context.requireExtension('modtype-bepinex');

    const modPath = path.join('BepInEx', 'plugins');

    context.registerGame({
        id: GAME_ID,
        name: 'Tainted Grail: The Fall of Avalon',
        shortName: 'TG:FoA',
        mergeMods: true,
        queryPath: () => util.GameStoreHelper.findByAppId([STEAM_ID, GOG_ID]).then(game => game.gamePath),
        setup: (discovery) => fs.ensureDirAsync(path.join(discovery.path, modPath)),
        logo: 'gameart.png',
        queryModPath: () => modPath,
        executable: () => GAME_EXE_FILENAME,
        requiredFiles: [
            GAME_EXE_FILENAME
        ],
        environment: {
            SteamAPPId: STEAM_ID,
        },
        details: {
            steamAppId: STEAM_ID,
            gogAppId: GOG_ID,
        },
    })

    const bepInConfig: IBepInExGameConfig = {
        gameId: GAME_ID,
        autoDownloadBepInEx: true,
        unityBuild: 'unityil2cpp',
        customPackDownloader: () => Promise.resolve(BEPINEX_DOWNLOAD_INFO),
    }
    context.once(() => {
        if (context.api.ext.bepinexAddGame !== undefined) {
            context.api.ext.bepinexAddGame(bepInConfig)
        }
    })
    return true
}

export default main