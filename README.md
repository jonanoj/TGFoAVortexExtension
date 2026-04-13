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

## Release

1. Update the version in `package.json` and `info.json`
2. Commit & push to GitHub
3. Create a new release with a tag matching the semver version (e.g. 1.4.0)

A release build will be automatically triggered, and an artifact will be attached to the build through [.github/workflows/release.yml](.github/workflows/release.yml).

Nexus Mods has a daily GithubAction that syncs mods - https://github.com/Nexus-Mods/Vortex-Backend/actions/workflows/update-extensions-manifest.yml

You can track it to see if your release has been picked up by Nexus Mods.
