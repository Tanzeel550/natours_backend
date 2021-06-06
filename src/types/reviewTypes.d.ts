import { Document, DocumentQuery, Schema } from 'mongoose';

interface ReviewType extends Document {
  review: string;
  rating: number;
  user: Schema.Types.ObjectId;
  tour: Schema.Types.ObjectId;
  r: ReviewType;
}

// export interface Interface extends ReviewType {}
// export interface ReviewDocumentType
//   extends DocumentQuery<Interface, Interface> {}

export default interface ReviewDocument extends ReviewType {}
