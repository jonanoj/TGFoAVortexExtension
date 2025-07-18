# Tainted Grail - The Fall of Avalon Vortex Extension

This extension adds support for managing BepInEx mods for Tainted Grail: The Fall of Avalon in Vortex Mod Manager. 

## Build

```shell
yarn build
```

## Run a dev version

Copy the contents of `dist` to `%APPDATA%\Vortex\plugins\tgfoadev`

```shell
rmdir /S /Q %APPDATA%\Vortex\plugins\tgfoadev
mkdir %APPDATA%\Vortex\plugins\tgfoadev
xcopy /Y /E /I dist %APPDATA%\Vortex\plugins\tgfoadev
```