import { Document, Schema } from 'mongoose';

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
