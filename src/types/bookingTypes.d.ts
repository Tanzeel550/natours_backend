import { Document, Schema } from 'mongoose';

interface BookingDocumentType extends Document {
  tour: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  createdAt: number;
  price: number;
  paid: boolean;
}
