import { createTestAccounts } from './createTestAccounts';
import { seedTestData } from './seedTestData';

async function setupTestEnvironment() {
  try {
    console.log('Starting test environment setup...');
    
    // First create the test accounts
    const accounts = await createTestAccounts();
    
    // Then seed the data using the created account UIDs
    if (accounts) {
      await seedTestData({
        studentUid: accounts.studentUid,
        teacherUid: accounts.teacherUid
      });
    }
    
    console.log('Test environment setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test environment:', error);
  }
}

setupTestEnvironment(); 