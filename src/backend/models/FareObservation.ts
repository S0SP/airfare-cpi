// src/models/FareObservation.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IFareObservation } from '../types';

export interface FareObservationDocument extends IFareObservation, Document {}

const FareObservationSchema = new Schema<FareObservationDocument>(
  {
    source: { type: String, required: true, default: 'Mock Scraper' },
    route: { type: String, required: true, index: true },
    origin: { type: String, required: true, uppercase: true },
    destination: { type: String, required: true, uppercase: true },
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    scrapedAt: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    leadTimeDays: { type: Number, required: true },
    baseFare: { type: Number, required: true, min: 0 },
    taxes: { type: Number, required: true, min: 0 },
    fees: { type: Number, required: true, min: 0 },
    totalFare: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'SOLD_OUT', 'LIMITED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true, collection: 'fare_observations' }
);

FareObservationSchema.index({ route: 1, airline: 1, scrapedAt: -1 });
FareObservationSchema.index({ origin: 1, destination: 1, scrapedAt: -1 });

export default mongoose.models.FareObservation || mongoose.model<FareObservationDocument>('FareObservation', FareObservationSchema);
