import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing a User document in MongoDB.
 * Extends Document from Mongoose to benefit from Mongoose methods.
 *
 * @interface IUserDocument
 * @extends {Document}
 */
export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
}

/**
 * Mongoose schema for the users collection.
 * Defines the structure and validations at the database level.
 */
const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false, // We manage createdAt manually
    versionKey: false, // Disables __v
    collection: 'users',
  }
);

/**
 * Mongoose model for the users collection.
 * Singleton - created only once.
 */
export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
