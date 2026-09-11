// src/repositories/logRepository.ts
import ApiLog, { ApiLogDocument } from '../models/ApiLog';
import { IApiLog } from '../types';

export class LogRepository {
  async create(data: Omit<IApiLog, 'createdAt'>): Promise<ApiLogDocument> {
    return ApiLog.create(data);
  }

  async findRecent(limit = 50): Promise<ApiLogDocument[]> {
    return ApiLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as ApiLogDocument[];
  }

  async deleteAll(): Promise<void> {
    await ApiLog.deleteMany({}).exec();
  }
}

export const logRepository = new LogRepository();
