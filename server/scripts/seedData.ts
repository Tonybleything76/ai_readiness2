import { storage } from '../storage';
import { PasswordService } from '../auth/passwordService';
import { AdminRole } from '@shared/schema';

/**
 * Seed development database with default organization and admin user
 */
export async function seedDevelopmentData() {
  try {
    console.log('🌱 Seeding development data...');

    // Check if default organization already exists
    let defaultOrg = await storage.getOrganizationByName('Default Organization');
    
    if (!defaultOrg) {
      // Create default organization
      defaultOrg = await storage.createOrganization({
        name: 'Default Organization',
        industry: 'Technology',
      });
      console.log('✅ Created default organization:', defaultOrg.name);
    } else {
      console.log('ℹ️ Default organization already exists');
    }

    // Check if default super admin already exists
    const adminEmail = 'admin@example.com';
    let defaultAdmin = await storage.getAdminByEmail(adminEmail);
    
    if (!defaultAdmin) {
      // Create default super admin
      const defaultPassword = process.env.ADMIN_PASS || 'Admin123!@#';
      const passwordHash = await PasswordService.hashPassword(defaultPassword);
      
      defaultAdmin = await storage.createAdmin({
        email: adminEmail,
        passwordHash,
        orgId: defaultOrg.id,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      });
      
      console.log('✅ Created default super admin:', adminEmail);
      console.log('🔑 Default password:', defaultPassword);
      console.log('⚠️  Please change the default password in production!');
    } else {
      console.log('ℹ️ Default admin already exists');
    }

    // Create a sample organization for testing multi-org features
    let sampleOrg = await storage.getOrganizationByName('Sample Company');
    
    if (!sampleOrg) {
      sampleOrg = await storage.createOrganization({
        name: 'Sample Company',
        industry: 'Healthcare',
      });
      console.log('✅ Created sample organization:', sampleOrg.name);
    }

    // Create a sample editor admin for the sample organization
    const editorEmail = 'editor@sample.com';
    let sampleAdmin = await storage.getAdminByEmail(editorEmail);
    
    if (!sampleAdmin) {
      const editorPassword = 'Editor123!@#';
      const passwordHash = await PasswordService.hashPassword(editorPassword);
      
      sampleAdmin = await storage.createAdmin({
        email: editorEmail,
        passwordHash,
        orgId: sampleOrg.id,
        role: AdminRole.EDITOR,
        isActive: true,
      });
      
      console.log('✅ Created sample editor admin:', editorEmail);
      console.log('🔑 Sample editor password:', editorPassword);
    }

    console.log('🎉 Development seed data completed successfully!');
    console.log('');
    console.log('You can now login with:');
    console.log('- Super Admin: admin@example.com / Admin123!@#');
    console.log('- Editor: editor@sample.com / Editor123!@#');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding development data:', error);
    return false;
  }
}

// Run if called directly (ES modules way)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDevelopmentData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}