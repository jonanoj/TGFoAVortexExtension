export const enum InstallationType {
  Mono = "Mono (v5)",
  IL2CPP = "IL2CPP (v6)",
}

export interface ExtensionSettings {
  monoMigrationNextReminderTime?: number;
}
