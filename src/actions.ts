import { createAction } from "redux-act";

export const setMonoMigrationNextReminderTime = createAction(
  "SET_TGFOA_MONO_MIGRATION_NEXT_REMINDER_TIME",
  (nextReminder: number) => ({ nextReminder }),
);
