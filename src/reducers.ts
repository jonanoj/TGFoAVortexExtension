import { types, util } from "vortex-api";
import { IState } from "vortex-api/lib/types/api";
import { setMonoMigrationNextReminderTime } from "./actions";
import { GAME } from "./consts";
import { ExtensionSettings } from "./types";

export function getSettings(state: IState): ExtensionSettings {
  return util.getSafe(state, ["settings", GAME.id], {});
}

export const settingsReducer: types.IReducerSpec = {
  reducers: {
    [setMonoMigrationNextReminderTime as any]: (state, payload) => {
      const { nextReminder } = payload;
      return util.setSafe(
        state,
        ["monoMigrationNextReminderTime"],
        nextReminder,
      );
    },
  },
  defaults: {},
};
