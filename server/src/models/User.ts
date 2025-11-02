import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWishlistItem {
  name: string;
  description?: string;
  link?: string;
  price?: number;
  reserved: boolean;
  reservedBy?: mongoose.Types.ObjectId;
}

export interface IWishlist {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  items: IWishlistItem[];
  createdAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  wishlists: IWishlist[];
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    interests: string[];
    giftIdeas: Array<{
      name: string;
      notes: string;
      purchased: boolean;
    }>;
  }>;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    wishlists: [
      {
        name: { type: String, required: true },
        description: String,
        visibility: { 
          type: String, 
          enum: ['public', 'private'],
          default: 'public'
        },
        items: [
          {
            name: { type: String, required: true },
            description: String,
            link: String,
            price: Number,
            reserved: { type: Boolean, default: false },
            reservedBy: { type: Schema.Types.ObjectId, ref: 'User' },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    contacts: [
      {
        name: { type: String, required: true },
        email: String,
        phone: String,
        notes: String,
        interests: [String],
        giftIdeas: [
          {
            name: { type: String, required: true },
            notes: String,
            purchased: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
