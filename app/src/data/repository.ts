export type EntityId = string;

export type EntityRecord = {
  id: EntityId;
  updatedAt?: string;
};

export interface Repository<T extends EntityRecord> {
  list(): Promise<T[]>;
  get(id: EntityId): Promise<T | null>;
  put(record: T): Promise<T>;
  putMany(records: T[]): Promise<T[]>;
  remove(id: EntityId): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryRepository<T extends EntityRecord> implements Repository<T> {
  private readonly rows = new Map<EntityId, T>();

  constructor(seed: T[] = []) {
    for (const row of seed) this.rows.set(row.id, structuredClone(row));
  }

  async list() {
    return [...this.rows.values()].map((row) => structuredClone(row));
  }

  async get(id: EntityId) {
    const row = this.rows.get(id);
    return row ? structuredClone(row) : null;
  }

  async put(record: T) {
    const next = structuredClone(record);
    this.rows.set(record.id, next);
    return structuredClone(next);
  }

  async putMany(records: T[]) {
    const out: T[] = [];
    for (const record of records) out.push(await this.put(record));
    return out;
  }

  async remove(id: EntityId) {
    this.rows.delete(id);
  }

  async clear() {
    this.rows.clear();
  }
}
