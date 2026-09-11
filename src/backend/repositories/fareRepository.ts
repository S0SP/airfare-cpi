// src/repositories/fareRepository.ts
import FareObservation, { FareObservationDocument } from '../models/FareObservation';

export class FareRepository {
  async findByRouteAndAirline(
    origin: string,
    destination: string,
    airline: string,
    fromDate: Date,
    toDate: Date
  ): Promise<FareObservationDocument[]> {
    return FareObservation.find({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      airline,
      scrapedAt: { $gte: fromDate, $lte: toDate },
    })
      .sort({ scrapedAt: 1 })
      .lean()
      .exec() as unknown as FareObservationDocument[];
  }

  async findLatest(origin: string, destination: string, airline: string): Promise<FareObservationDocument | null> {
    return FareObservation.findOne({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      airline,
      availabilityStatus: 'AVAILABLE',
    })
      .sort({ scrapedAt: -1 })
      .lean()
      .exec() as unknown as FareObservationDocument | null;
  }

  async getDistinctRoutes(): Promise<string[]> {
    return FareObservation.distinct('route').exec();
  }

  async getDistinctAirlines(): Promise<string[]> {
    return FareObservation.distinct('airline').exec();
  }

  async insertMany(records: Partial<FareObservationDocument>[]): Promise<number> {
    const result = await FareObservation.insertMany(records, { ordered: false });
    return result.length;
  }

  async count(): Promise<number> {
    return FareObservation.countDocuments().exec();
  }

  async deleteAll(): Promise<void> {
    await FareObservation.deleteMany({}).exec();
  }
}

export const fareRepository = new FareRepository();
