import { Document } from "mongoose";

export interface IBaseRepository<T extends Document> {
  create(item: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  updateById(id: string, update: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<void>;
}
