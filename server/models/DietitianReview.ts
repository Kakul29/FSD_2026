import mongoose, { Schema } from 'mongoose';

export type ReviewVerdict = 'everyday' | 'occasional' | 'rarely' | 'avoid';
export const REVIEW_VERDICTS: ReviewVerdict[] = ['everyday', 'occasional', 'rarely', 'avoid'];

export interface IDietitianReview {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  image?: string;
  dietitianId: string;
  dietitianName: string;
  credentials?: string;
  verdict: ReviewVerdict;
  rating: number; // 1-5
  comment: string;
  suitableFor: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewInput = Omit<IDietitianReview, 'id' | 'createdAt' | 'updatedAt'>;

const DietitianReviewSchema = new Schema(
  {
    barcode: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    brand: { type: String, default: 'Unknown Brand' },
    image: String,
    dietitianId: { type: String, required: true, index: true },
    dietitianName: { type: String, required: true },
    credentials: String,
    verdict: { type: String, enum: REVIEW_VERDICTS, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxlength: 2000 },
    suitableFor: { type: [String], default: [] },
  },
  { timestamps: true }
);
// One review per dietitian per product; submitting again updates it
DietitianReviewSchema.index({ barcode: 1, dietitianId: 1 }, { unique: true });

const MongooseReviewModel =
  mongoose.models.DietitianReview || mongoose.model('DietitianReview', DietitianReviewSchema);

const inMemoryReviews: Map<string, IDietitianReview> = new Map();
const keyOf = (barcode: string, dietitianId: string) => `${dietitianId}::${barcode}`;

function fromMongo(doc: any): IDietitianReview {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    barcode: o.barcode,
    productName: o.productName,
    brand: o.brand,
    image: o.image,
    dietitianId: o.dietitianId,
    dietitianName: o.dietitianName,
    credentials: o.credentials,
    verdict: o.verdict,
    rating: o.rating,
    comment: o.comment,
    suitableFor: o.suitableFor || [],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

const byNewest = (a: IDietitianReview, b: IDietitianReview) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

const useMongo = () => mongoose.connection.readyState === 1;

export class DietitianReviewRepository {
  static async upsert(input: ReviewInput): Promise<IDietitianReview> {
    if (useMongo()) {
      const doc = await MongooseReviewModel.findOneAndUpdate(
        { barcode: input.barcode, dietitianId: input.dietitianId },
        { $set: input },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return fromMongo(doc);
    }

    const key = keyOf(input.barcode, input.dietitianId);
    const existing = inMemoryReviews.get(key);
    const now = new Date();
    const review: IDietitianReview = {
      ...input,
      id: existing?.id || 'review_' + Math.random().toString(36).substring(2, 11),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    inMemoryReviews.set(key, review);
    return review;
  }

  static async listForProduct(barcode: string): Promise<IDietitianReview[]> {
    if (useMongo()) {
      const docs = await MongooseReviewModel.find({ barcode }).sort({ updatedAt: -1 });
      return docs.map(fromMongo);
    }
    return [...inMemoryReviews.values()].filter((r) => r.barcode === barcode).sort(byNewest);
  }

  static async listByDietitian(dietitianId: string): Promise<IDietitianReview[]> {
    if (useMongo()) {
      const docs = await MongooseReviewModel.find({ dietitianId }).sort({ updatedAt: -1 });
      return docs.map(fromMongo);
    }
    return [...inMemoryReviews.values()].filter((r) => r.dietitianId === dietitianId).sort(byNewest);
  }

  static async remove(barcode: string, dietitianId: string): Promise<boolean> {
    if (useMongo()) {
      const res = await MongooseReviewModel.deleteOne({ barcode, dietitianId });
      return res.deletedCount > 0;
    }
    return inMemoryReviews.delete(keyOf(barcode, dietitianId));
  }
}
