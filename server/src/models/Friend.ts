import mongoose, { Document, Schema } from 'mongoose';

export interface IFriend extends Document {
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  requestedBy: mongoose.Types.ObjectId;
  requestedAt: Date;
  acceptedAt?: Date;
  groups: string[];
}

const friendSchema = new Schema<IFriend>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    groups: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate friend relationships
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

// Index for faster queries
friendSchema.index({ userId: 1, status: 1 });
friendSchema.index({ friendId: 1, status: 1 });

const Friend = mongoose.model<IFriend>('Friend', friendSchema);

export default Friend;
