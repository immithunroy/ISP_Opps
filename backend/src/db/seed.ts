import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config';
import { logger } from '../utils/logger';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';

const seedDatabase = async (): Promise<void> => {
  try {
    const uri = appConfig.env === 'test' ? appConfig.mongodb.uriTest : appConfig.mongodb.uri;
    
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB for seeding');

    // Seed Roles
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

    for (const roleData of roles) {
      const existing = await Role.findOne({ name: roleData.name });
      if (!existing) {
        await Role.create(roleData);
        logger.info(`Created role: ${roleData.name}`);
      }
    }

    // Seed Permissions
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
      const existing = await Permission.findOne({ resource: perm.resource });
      if (!existing) {
        await Permission.create(perm);
        logger.info(`Created permission: ${perm.resource}`);
      }
    }

    // Seed Super Admin User
    const existingAdmin = await User.findOne({ username: 'superadmin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin@123', appConfig.security.bcryptRounds);
      
      await User.create({
        username: 'superadmin',
        email: 'superadmin@isp-platform.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        permissions: ['*'],
        isActive: true,
      });
      
      logger.info('Created superadmin user: superadmin / SuperAdmin@123');
    }

    // Seed a default employee for testing
    const existingEmployee = await Employee.findOne({ employeeCode: 'EMP001' });
    if (!existingEmployee) {
      await Employee.create({
        employeeId: 'EMP001',
        employeeCode: 'EMP001',
        name: 'John Doe',
        department: 'IT',
        designation: 'Network Engineer',
        mobile: '+1234567890',
        email: 'john.doe@isp-platform.com',
        address: '123 Main St, City',
        joiningDate: new Date(),
        isActive: true,
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          mobile: '+1234567891',
        },
      });
      logger.info('Created default employee: EMP001');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});