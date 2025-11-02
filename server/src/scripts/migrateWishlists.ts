import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const migrateWishlists = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB connected for migration');

    // Find all users with old wishlist structure
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;

    for (const user of users) {
      // Check if user has old wishlist field (not wishlists array)
      const userDoc: any = user.toObject();
      
      if (userDoc.wishlist && Array.isArray(userDoc.wishlist) && userDoc.wishlist.length > 0) {
        console.log(`Migrating user: ${user.name} (${user.email})`);
        
        // Create a default wishlist with all existing items
        const defaultWishlist = {
          name: 'My Wishlist',
          description: 'My default wishlist',
          visibility: 'public',
          items: userDoc.wishlist,
          createdAt: new Date(),
        };

        // Update user with new structure
        await User.updateOne(
          { _id: user._id },
          {
            $set: { wishlists: [defaultWishlist] },
            $unset: { wishlist: 1 },
          }
        );

        migratedCount++;
        console.log(`✓ Migrated ${userDoc.wishlist.length} items for ${user.name}`);
      } else if (!userDoc.wishlists || userDoc.wishlists.length === 0) {
        // User has no wishlist, create empty wishlists array
        await User.updateOne(
          { _id: user._id },
          {
            $set: { wishlists: [] },
            $unset: { wishlist: 1 },
          }
        );
        console.log(`✓ Initialized empty wishlists for ${user.name}`);
      } else {
        console.log(`- User ${user.name} already migrated`);
      }
    }

    console.log(`\nMigration complete! Migrated ${migratedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateWishlists();
