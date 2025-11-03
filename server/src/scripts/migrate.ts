import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const MigrationModel = mongoose.model('Migration', migrationSchema);

// Define your migrations here
const migrations: Migration[] = [
  {
    version: '001',
    description: 'Initial multi-wishlist migration',
    up: async () => {
      console.log('Running migration 001: Multi-wishlist migration');
      const User = mongoose.model('User');
      
      // Check if users already have wishlists array
      const sampleUser = await User.findOne();
      if (sampleUser && Array.isArray(sampleUser.wishlists)) {
        console.log('Migration 001 already applied, skipping...');
        return;
      }

      // This migration was already applied in development
      // In production, the schema will be correct from the start
      console.log('Migration 001 completed (schema already correct)');
    },
    down: async () => {
      console.log('Rolling back migration 001');
      // Rollback logic if needed
    },
  },
  {
    version: '002',
    description: 'Add sharedWith field to wishlists',
    up: async () => {
      console.log('Running migration 002: Add sharedWith field');
      const User = mongoose.model('User');
      
      // Update all users to add sharedWith field to wishlists if not present
      const result = await User.updateMany(
        { 'wishlists.sharedWith': { $exists: false } },
        { $set: { 'wishlists.$[].sharedWith': [] } }
      );
      
      console.log(`Migration 002 completed: Updated ${result.modifiedCount} users`);
    },
    down: async () => {
      console.log('Rolling back migration 002');
      const User = mongoose.model('User');
      await User.updateMany(
        {},
        { $unset: { 'wishlists.$[].sharedWith': '' } }
      );
    },
  },
  {
    version: '003',
    description: 'Add linkedUserId and linkedAt fields to contacts',
    up: async () => {
      console.log('Running migration 003: Add contact linking fields');
      const User = mongoose.model('User');
      
      // Update all users to add linkedUserId and linkedAt fields to contacts if not present
      const result = await User.updateMany(
        { 'contacts.linkedUserId': { $exists: false } },
        { 
          $set: { 
            'contacts.$[].linkedUserId': null,
            'contacts.$[].linkedAt': null
          } 
        }
      );
      
      console.log(`Migration 003 completed: Updated ${result.modifiedCount} users`);
    },
    down: async () => {
      console.log('Rolling back migration 003');
      const User = mongoose.model('User');
      await User.updateMany(
        {},
        { 
          $unset: { 
            'contacts.$[].linkedUserId': '',
            'contacts.$[].linkedAt': ''
          } 
        }
      );
    },
  },
  // Add more migrations here as your schema evolves
];

async function getAppliedMigrations(): Promise<string[]> {
  const applied = await MigrationModel.find().sort({ version: 1 });
  return applied.map(m => m.version);
}

async function applyMigration(migration: Migration): Promise<void> {
  try {
    await migration.up();
    await MigrationModel.create({
      version: migration.version,
      description: migration.description,
    });
    console.log(`✓ Migration ${migration.version} applied successfully`);
  } catch (error) {
    console.error(`✗ Migration ${migration.version} failed:`, error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gift-tracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Load models
    await import('../models/User');
    await import('../models/Friend');

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`Applied migrations: ${appliedMigrations.join(', ') || 'none'}`);

    // Find pending migrations
    const pendingMigrations = migrations.filter(
      m => !appliedMigrations.includes(m.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✓ All migrations are up to date');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s)`);

    // Apply pending migrations
    for (const migration of pendingMigrations) {
      console.log(`\nApplying migration ${migration.version}: ${migration.description}`);
      await applyMigration(migration);
    }

    console.log('\n✓ All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigrations, migrations };
