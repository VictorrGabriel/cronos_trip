export interface BaseRepository<T> {
  findAll(): Promise<T[]>;

  findById(id: number | string | bigint): Promise<T | null>;

  findByPublicId(publicId:  string): Promise<T | null>;

  delete(id: number | string | bigint): Promise<T>;

  deleteByPublicId(publicId: string): Promise<T>;
}
