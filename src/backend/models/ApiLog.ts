// src/models/ApiLog.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IApiLog } from '../types';

export interface ApiLogDocument extends IApiLog, Document {}

const ApiLogSchema = new Schema<ApiLogDocument>(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true, collection: 'api_logs' }
);

// Auto-delete logs older than 24h to keep the demo DB clean
ApiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
ApiLogSchema.index({ timestamp: -1 });

export default mongoose.models.ApiLog || mongoose.model<ApiLogDocument>('ApiLog', ApiLogSchema);
