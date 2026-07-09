import mongoose from 'mongoose';
import { appConfig } from '../config';
import { logger } from '../utils/logger';

const migrateDatabase = async (): Promise<void> => {
  try {
    const uri = appConfig.env === 'test' ? appConfig.mongodb.uriTest : appConfig.mongodb.uri;
    
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB for migration');

    const db = mongoose.connection.db;
    
    // Create collections with validators
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);

    // Employees collection
    if (!existingCollections.includes('employees')) {
      await db.createCollection('employees', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['employeeId', 'employeeCode', 'name', 'department', 'designation', 'mobile', 'email', 'address', 'joiningDate'],
            properties: {
              employeeId: { bsonType: 'string' },
              employeeCode: { bsonType: 'string' },
              name: { bsonType: 'string' },
              department: { bsonType: 'string' },
              designation: { bsonType: 'string' },
              mobile: { bsonType: 'string' },
              email: { bsonType: 'string' },
              address: { bsonType: 'string' },
              joiningDate: { bsonType: 'date' },
              isActive: { bsonType: 'bool' },
              faceEmbedding: { bsonType: 'array' },
            }
          }
        }
      });
      logger.info('Created employees collection with validator');
    }

    // Assets collection
    if (!existingCollections.includes('assets')) {
      await db.createCollection('assets', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['assetId', 'name', 'category', 'type', 'gps', 'address', 'area', 'zone', 'district', 'division', 'installationDate', 'installedBy'],
            properties: {
              assetId: { bsonType: 'string' },
              name: { bsonType: 'string' },
              category: { bsonType: 'string' },
              type: { bsonType: 'string' },
              gps: {
                bsonType: 'object',
                required: ['latitude', 'longitude'],
                properties: {
                  latitude: { bsonType: 'double' },
                  longitude: { bsonType: 'double' },
                }
              },
              status: { enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'] },
            }
          }
        }
      });
      logger.info('Created assets collection with validator');
    }

    // Attendance collection
    if (!existingCollections.includes('attendance')) {
      await db.createCollection('attendance');
      logger.info('Created attendance collection');
    }

    // Fiber routes collection
    if (!existingCollections.includes('fiber_routes')) {
      await db.createCollection('fiber_routes');
      logger.info('Created fiber_routes collection');
    }

    // Splitters collection
    if (!existingCollections.includes('splitters')) {
      await db.createCollection('splitters');
      logger.info('Created splitters collection');
    }

    // Splices collection
    if (!existingCollections.includes('splices')) {
      await db.createCollection('splices');
      logger.info('Created splices collection');
    }

    // TJ Boxes collection
    if (!existingCollections.includes('tj_boxes')) {
      await db.createCollection('tj_boxes');
      logger.info('Created tj_boxes collection');
    }

    // Maintenance collection
    if (!existingCollections.includes('maintenance')) {
      await db.createCollection('maintenance');
      logger.info('Created maintenance collection');
    }

    // Users collection
    if (!existingCollections.includes('users')) {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'email', 'password', 'role'],
            properties: {
              username: { bsonType: 'string' },
              email: { bsonType: 'string' },
              password: { bsonType: 'string' },
              role: { bsonType: 'string' },
              isActive: { bsonType: 'bool' },
            }
          }
        }
      });
      logger.info('Created users collection with validator');
    }

    // Audit logs collection
    if (!existingCollections.includes('audit_logs')) {
      await db.createCollection('audit_logs');
      logger.info('Created audit_logs collection');
    }

    // Notifications collection
    if (!existingCollections.includes('notifications')) {
      await db.createCollection('notifications');
      logger.info('Created notifications collection');
    }

    // Roles collection
    if (!existingCollections.includes('roles')) {
      await db.createCollection('roles');
      logger.info('Created roles collection');
    }

    // Permissions collection
    if (!existingCollections.includes('permissions')) {
      await db.createCollection('permissions');
      logger.info('Created permissions collection');
    }

    // Create indexes
    logger.info('Creating indexes...');

    // Employees indexes
    await db.collection('employees').createIndex({ employeeId: 1 }, { unique: true });
    await db.collection('employees').createIndex({ employeeCode: 1 }, { unique: true });
    await db.collection('employees').createIndex({ email: 1 }, { unique: true });
    await db.collection('employees').createIndex({ mobile: 1 }, { unique: true });
    await db.collection('employees').createIndex({ department: 1, isActive: 1 });
    await db.collection('employees').createIndex({ name: 'text', employeeCode: 'text', email: 'text' });

    // Assets indexes
    await db.collection('assets').createIndex({ assetId: 1 }, { unique: true });
    await db.collection('assets').createIndex({ category: 1, status: 1 });
    await db.collection('assets').createIndex({ 'gps.latitude': 1, 'gps.longitude': 1 }, { name: 'geospatial' });
    await db.collection('assets').createIndex({ zone: 1, district: 1, division: 1 });
    await db.collection('assets').createIndex({ name: 'text', assetId: 'text', address: 'text' });
    await db.collection('assets').createIndex({ serialNumber: 1 }, { unique: true, sparse: true });

    // Attendance indexes
    await db.collection('attendance').createIndex({ employee: 1, date: 1, type: 1 }, { unique: true });
    await db.collection('attendance').createIndex({ date: 1, type: 1 });
    await db.collection('attendance').createIndex({ isOfflineSync: 1, syncedAt: 1 });

    // Fiber routes indexes
    await db.collection('fiber_routes').createIndex({ routeId: 1 }, { unique: true });
    await db.collection('fiber_routes').createIndex({ polyline: '2dsphere' });
    await db.collection('fiber_routes').createIndex({ installationType: 1 });

    // Splitters indexes
    await db.collection('splitters').createIndex({ splitterId: 1 }, { unique: true });
    await db.collection('splitters').createIndex({ 'location.latitude': 1, 'location.longitude': 1 });
    await db.collection('splitters').createIndex({ ratio: 1, status: 1 });

    // Splices indexes
    await db.collection('splices').createIndex({ spliceId: 1 }, { unique: true });
    await db.collection('splices').createIndex({ cableA: 1, cableB: 1 });
    await db.collection('splices').createIndex({ spliceBox: 1 });

    // TJ Boxes indexes
    await db.collection('tj_boxes').createIndex({ tjBoxId: 1 }, { unique: true });
    await db.collection('tj_boxes').createIndex({ 'gps.latitude': 1, 'gps.longitude': 1 });

    // Maintenance indexes
    await db.collection('maintenance').createIndex({ asset: 1, status: 1 });
    await db.collection('maintenance').createIndex({ scheduledDate: 1, status: 1 });

    // Users indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1, isActive: 1 });

    // Audit logs indexes
    await db.collection('audit_logs').createIndex({ user: 1, createdAt: -1 });
    await db.collection('audit_logs').createIndex({ resource: 1, resourceId: 1, createdAt: -1 });
    await db.collection('audit_logs').createIndex({ action: 1, createdAt: -1 });
    await db.collection('audit_logs').createIndex({ createdAt: -1 });
    // TTL index - expire after 1 year
    await db.collection('audit_logs').createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

    logger.info('All indexes created successfully');
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

migrateDatabase().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});