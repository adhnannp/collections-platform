import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from '../core/interface/repository/Ibase.repository';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) {}

  async create(item: Partial<T>): Promise<T> {
    const doc = new this.model(item);
    return await doc.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findAll(filter: FilterQuery<T>): Promise<T[] | null> {
    return this.model.find(filter);
  }

  async updateById(id: string, update: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
  
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

}
