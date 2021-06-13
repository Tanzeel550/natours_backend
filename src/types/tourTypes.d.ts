import { Document, Schema } from 'mongoose';
import { Request } from 'express';

export default interface TourDocumentType extends Document {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary?: string;
  description?: string;
  imageCover: string;
  images?: [string];
  startDates?: [Date];
  startLocation: string;
  locations: [
    {
      type: 'Point';
      description: string;
      address: string;
      coordinates: [number];
    }
  ];
  guides: Schema.Types.ObjectId;
}

export interface IGetTourInfoRequest extends Request {
  tour?: TourDocumentType;
}
