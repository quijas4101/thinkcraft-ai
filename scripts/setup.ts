require('dotenv').config({ path: '.env.local' });
const { setupFirebase } = require('./setupFirebase');
const { setupInitialData } = require('./setupInitialData');

async function runSetup() {
  try {
    console.log('🚀 Starting complete setup...');
    
    // Run Firebase setup first (creates test accounts)
    await setupFirebase();
    
    // Get the test accounts we created
    const testAccounts = [
      {
        email: 'student@test.com',
        uid: '', // Will be filled after creation
        role: 'student'
      },
      {
        email: 'teacher@test.com',
        uid: '', // Will be filled after creation
        role: 'teacher'
      }
    ];
    
    // Setup initial data for each account
    for (const account of testAccounts) {
      await setupInitialData(account.uid, account.role);
    }
    
    console.log('✨ Complete setup finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

runSetup(); 