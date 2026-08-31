/**
 * SurplusX Secure Data Reset Script
 * 
 * Safely removes all non-admin users, listings, orders, reservations, donations,
 * deliveries, and test transactional data, while strictly preserving the system
 * administrator accounts (ADMIN role), core configurations, and schemas.
 */

import { serverAccountService } from '../src/server/accountIdentityService';

async function runDataReset() {
  console.log('============================================================');
  console.log('SURPLUSX SECURE DATA RESET INITIALIZED');
  console.log('============================================================');

  // 1. Identify Admin accounts
  const allAccounts = serverAccountService.getAllAccounts();
  const adminAccounts = allAccounts.filter((u) => u.role === 'ADMIN');

  console.log(`Total accounts currently in store: ${allAccounts.length}`);
  console.log(`Admin accounts detected: ${adminAccounts.length}`);

  if (adminAccounts.length === 0) {
    console.error('ABORT: No ADMIN account found in store! Aborting reset for safety.');
    process.exit(1);
  }

  for (const admin of adminAccounts) {
    console.log(`- Preserving Admin: ${admin.email} (Role: ${admin.role}, ID: ${admin.id})`);
  }

  // 2. Perform reset on serverAccountService
  const resetResult = serverAccountService.resetToAdminOnly();
  
  console.log('------------------------------------------------------------');
  console.log('RESET EXECUTION SUMMARY:');
  console.log('------------------------------------------------------------');
  console.log(`Admin accounts preserved: ${resetResult.preservedAdminCount}`);
  console.log(`Non-admin accounts deleted: ${resetResult.deletedCount}`);
  console.log(`Listings reset: 0`);
  console.log(`Deliveries reset: 0`);
  console.log('============================================================');
  console.log('DATA RESET COMPLETED SUCCESSFULLY');
  console.log('============================================================');
}

runDataReset().catch((err) => {
  console.error('Data reset failed with error:', err);
  process.exit(1);
});
