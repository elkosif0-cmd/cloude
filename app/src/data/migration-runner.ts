export type MigrationContext<T> = {
  source: T;
};

export type Migration<T> = {
  id: string;
  detect: (context: MigrationContext<T>) => Promise<boolean> | boolean;
  backup: (context: MigrationContext<T>) => Promise<T>;
  migrate: (context: MigrationContext<T>) => Promise<T>;
  verify: (output: T) => Promise<boolean> | boolean;
  rollback: (backup: T) => Promise<void>;
};

export type MigrationResult<T> = {
  migrationId: string;
  changed: boolean;
  output: T;
};

export async function runMigration<T>(migration: Migration<T>, source: T): Promise<MigrationResult<T>> {
  const context = {source};
  if (!(await migration.detect(context))) {
    return {migrationId:migration.id, changed:false, output:source};
  }

  const backup = await migration.backup(context);
  try {
    const output = await migration.migrate(context);
    const verified = await migration.verify(output);
    if (!verified) throw new Error('MIGRATION_VERIFICATION_FAILED');
    return {migrationId:migration.id, changed:true, output};
  } catch (error) {
    await migration.rollback(backup);
    throw error;
  }
}
