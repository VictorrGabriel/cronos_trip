export interface BaseRepository<T> {
  findAll(): Promise<T[]>;

  findById(id: number | string | bigint): Promise<T | null>;

  delete(id: number | string | bigint): Promise<T>;
}
