import { setMonoMigrationNextReminderTime } from "./actions";
import { BEPINEX5_DOWNLOAD_INFO, GAME } from "./consts";
import { getSettings } from "./reducers";

export function showMonoMigrationReminder(context) {
  const state = context.api.store.getState();
  const settings = getSettings(state);

  const t = context.api.translate;
  const shouldShowReminder =
    settings.monoMigrationNextReminderTime == undefined ||
    (settings.monoMigrationNextReminderTime !== -1 && // -1 means the user has dismissed forever
      settings.monoMigrationNextReminderTime < Date.now());

  if (shouldShowReminder) {
    const replace = {
      game: GAME.name,
      bl: "[br][/br]",
    };
    context.api.showDialog(
      "info",
      "Mono Version available",
      {
        bbcode: t(
          "Your {{game}} installation is using the IL2CPP build.{{bl}}" +
            "Mods are considered unstable on this version, and your game might crash frequently.{{bl}}" +
            "It is [b]highly recommended[/b] to use the [b]Mono[/b] version instead.{{bl}}{{bl}}" +
            "Follow the BepInEx Mono description on how to switch to the Mono build.{{bl}}{{bl}}" +
            "After switching, delete your existing BepInEx installation and Vortex should automatically download the Mono version for you.",
          { replace },
        ),
      },
      [
        {
          label: t("Open Guide"),
          action: () =>
            context.api.ext.nexusOpenModPage(
              GAME.id,
              BEPINEX5_DOWNLOAD_INFO.modId,
              "nexus",
            ),
        },
        {
          label: t("Remind in 1 week"),
          action: () => {
            const nextReminder = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week later
            context.api.store.dispatch(
              setMonoMigrationNextReminderTime(nextReminder),
            );
          },
        },
        {
          label: t("Never show again"),
          action: () => {
            context.api.store.dispatch(setMonoMigrationNextReminderTime(-1));
          },
        },
      ],
    );
  }
}
