const { MongoClient } = require('mongodb');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:changeme123@localhost:27017/isp-platform?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('isp-platform');

    // Create collections with validation
    await createCollections(db);
    
    // Create indexes
    await createIndexes(db);
    
    // Seed initial data
    await seedInitialData(db);

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
  }
}

async function createCollections(db) {
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
  }

  // Attendance collection
  if (!existingCollections.includes('attendance')) {
    await db.createCollection('attendance');
  }

  // Fiber Routes collection
  if (!existingCollections.includes('fiber_routes')) {
    await db.createCollection('fiber_routes');
  }

  // Splitters collection
  if (!existingCollections.includes('splitters')) {
    await db.createCollection('splitters');
  }

  // Splices collection
  if (!existingCollections.includes('splices')) {
    await db.createCollection('splices');
  }

  // TJ Boxes collection
  if (!existingCollections.includes('tj_boxes')) {
    await db.createCollection('tj_boxes');
  }

  // Maintenance collection
  if (!existingCollections.includes('maintenance')) {
    await db.createCollection('maintenance');
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
  }

  // Audit Logs collection
  if (!existingCollections.includes('audit_logs')) {
    await db.createCollection('audit_logs');
  }

  // Notifications collection
  if (!existingCollections.includes('notifications')) {
    await db.createCollection('notifications');
  }

  console.log('Collections created');
}

async function createIndexes(db) {
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
  await db.collection('assets').createIndex({ 'gps.latitude': 1, 'gps.longitude': 1 });
  await db.collection('assets').createIndex({ zone: 1, district: 1, division: 1 });
  await db.collection('assets').createIndex({ name: 'text', assetId: 'text', address: 'text' });
  await db.collection('assets').createIndex({ serialNumber: 1 }, { unique: true, sparse: true });

  // Attendance indexes
  await db.collection('attendance').createIndex({ employee: 1, date: 1, type: 1 }, { unique: true });
  await db.collection('attendance').createIndex({ date: 1, type: 1 });
  await db.collection('attendance').createIndex({ isOfflineSync: 1, syncedAt: 1 });

  // Fiber Routes indexes
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

  // Audit Logs indexes
  await db.collection('audit_logs').createIndex({ user: 1, createdAt: -1 });
  await db.collection('audit_logs').createIndex({ resource: 1, resourceId: 1, createdAt: -1 });
  await db.collection('audit_logs').createIndex({ action: 1, createdAt: -1 });
  await db.collection('audit_logs').createIndex({ createdAt: -1 });
  await db.collection('audit_logs').createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

  console.log('Indexes created');
}

async function seedInitialData(db) {
  const bcrypt = require('bcryptjs');
  
  // Check if super admin exists
  const existingAdmin = await db.collection('users').findOne({ username: 'superadmin' });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);
    
    await db.collection('users').insertOne({
      username: 'superadmin',
      email: 'superadmin@isp-platform.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isActive: true,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Default super admin created: superadmin / SuperAdmin@123');
  }

  // Create default roles if not exist
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system access', permissions: ['*'] },
    { name: 'ADMINISTRATOR', description: 'System administration', permissions: ['users:read', 'users:write', 'roles:read', 'roles:write', 'assets:read', 'assets:write', 'attendance:read', 'attendance:write', 'reports:read', 'reports:export'] },
    { name: 'HR', description: 'Human Resources', permissions: ['employees:read', 'employees:write', 'attendance:read', 'attendance:write', 'reports:read'] },
    { name: 'NOC_ENGINEER', description: 'Network Operations Center', permissions: ['assets:read', 'assets:write', 'fiber:read', 'fiber:write', 'maintenance:read', 'maintenance:write', 'alerts:read'] },
    { name: 'GIS_MANAGER', description: 'GIS Network Management', permissions: ['assets:read', 'assets:write', 'fiber:read', 'fiber:write', 'splitters:read', 'splitters:write', 'map:read', 'map:write'] },
    { name: 'SUPERVISOR', description: 'Field Supervisor', permissions: ['employees:read', 'attendance:read', 'attendance:write', 'assets:read', 'maintenance:read', 'maintenance:write'] },
    { name: 'TECHNICIAN', description: 'Field Technician', permissions: ['attendance:write', 'assets:read', 'splices:read', 'splices:write', 'maintenance:read', 'maintenance:write'] },
    { name: 'FIELD_ENGINEER', description: 'Field Engineer', permissions: ['assets:read', 'assets:write', 'fiber:read', 'splitters:read', 'splices:read', 'splices:write', 'maintenance:read', 'maintenance:write'] },
    { name: 'READ_ONLY', description: 'Read only access', permissions: ['assets:read', 'attendance:read', 'fiber:read', 'reports:read'] },
  ];

  for (const role of roles) {
    const existing = await db.collection('roles').findOne({ name: role.name });
    if (!existing) {
      await db.collection('roles').insertOne({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Create default permissions
  const permissions = [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'permissions', actions: ['read'] },
    { resource: 'employees', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'attendance', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'assets', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'fiber', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'splitters', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'splices', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'tjboxes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'maintenance', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'map', actions: ['read', 'write'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'audit', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'update'] },
    { resource: 'import-export', actions: ['create', 'read'] },
  ];

  for (const perm of permissions) {
    const existing = await db.collection('permissions').findOne({ resource: perm.resource });
    if (!existing) {
      await db.collection('permissions').insertOne({
        ...perm,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log('Initial data seeded');
}

seedDatabase().catch(console.error);