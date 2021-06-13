import { HookNextFunction, model, Schema } from 'mongoose';
import TourDocumentType from '../types/tourTypes';

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minLength: 8,
      maxLength: 64
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'MaxGroupSize is required']
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficult must be one of easy, medium or hard'
      },
      required: [true, 'Difficulty is required']
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Ratings Average must be greater than 1'],
      max: [5, 'Ratings Average must be lesser than 5'],
      default: 4.5,
      set: (val: number) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: TourDocumentType, val: number) {
          return val < this.price;
        },
        message: 'Price Discount must not be greater han price'
      }
    },
    summary: {
      type: String,
      required: [true, 'Summary is required']
    },
    description: {
      type: String
    },
    imageCover: {
      type: String,
      required: [true, 'Image cover is required']
    },
    images: {
      type: [String]
    },
    startDates: {
      type: [Date]
    },
    startLocation: {
      description: String,
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        description: String,
        address: String,
        coordinates: [Number]
      }
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.virtual('slug').get(function () {
//     return slugify(this.name, {
//         lower: true
//     });
// });

tourSchema.virtual('reviews', {
  ref: 'reviews',
  localField: '_id',
  foreignField: 'tour'
});

tourSchema.pre(
  // @ts-ignore
  /^find/,
  function (this: TourDocumentType, next: HookNextFunction) {
    this.populate({
      path: 'guides',
      select:
        '-passwordResetToken -passwordResetTokenTimeOut -changedPasswordAt -isVerified'
    });
    this.populate('reviews');
    next();
  }
);

// tourSchema.virtual("createdAt").get(function () {
//     return this._id.getTimestamp()
// })

// Embedding before saving. Similarly we can also embed documents before "find"
// tourSchema.pre("save", async function (next) {
//     const guidesPromise = this.guides.map(async guideId => await UserModel.findById(guideId).select("name email"))
//     this.guides = await Promise.all(guidesPromise)
//     next()
// })

const TourModel = model<TourDocumentType>('tours', tourSchema);

export = TourModel;
