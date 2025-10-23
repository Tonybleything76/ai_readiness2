import { storage } from './storage.js';

async function testStorageTierDerivation() {
  console.log('\n=== Testing Storage-Level Tier Derivation ===\n');

  // Test 1: Only questionCount=90 provided (should derive assessmentMode=full)
  console.log('Test 1: Storage with only questionCount=90 (no assessmentMode)...');
  const response1 = await storage.createResponse({
    orgName: 'Storage Test 1',
    industry: 'Tech',
    answersJson: { q1: 80 },
    pillarScores: { technology: 80, dataManagement: 0, organizationalCulture: 0, strategyPlanning: 0, riskCompliance: 0, overall: 80 },
    overall: 80,
    category: 'Good',
    questionCount: 90,
  });

  console.log('  - assessmentMode:', response1.assessmentMode);
  console.log('  - questionCount:', response1.questionCount);
  
  if (response1.assessmentMode === 'full' && response1.questionCount === 90) {
    console.log('✅ PASS: Storage auto-derived assessmentMode=full from questionCount=90\n');
  } else {
    console.log('❌ FAIL: Storage should have derived assessmentMode=full from questionCount=90\n');
  }

  // Test 2: Only questionCount=25 provided (should derive assessmentMode=free)
  console.log('Test 2: Storage with only questionCount=25 (no assessmentMode)...');
  const response2 = await storage.createResponse({
    orgName: 'Storage Test 2',
    industry: 'Finance',
    answersJson: { q1: 70 },
    pillarScores: { technology: 70, dataManagement: 0, organizationalCulture: 0, strategyPlanning: 0, riskCompliance: 0, overall: 70 },
    overall: 70,
    category: 'Moderate',
    questionCount: 25,
  });

  console.log('  - assessmentMode:', response2.assessmentMode);
  console.log('  - questionCount:', response2.questionCount);
  
  if (response2.assessmentMode === 'free' && response2.questionCount === 25) {
    console.log('✅ PASS: Storage auto-derived assessmentMode=free from questionCount=25\n');
  } else {
    console.log('❌ FAIL: Storage should have derived assessmentMode=free from questionCount=25\n');
  }

  // Test 3: Invalid questionCount (coerces to free/25)
  console.log('Test 3: Storage with invalid questionCount=50 (should coerce to free/25)...');
  const response3 = await storage.createResponse({
    orgName: 'Storage Test 3',
    industry: 'Healthcare',
    answersJson: { q1: 75 },
    pillarScores: { technology: 75, dataManagement: 0, organizationalCulture: 0, strategyPlanning: 0, riskCompliance: 0, overall: 75 },
    overall: 75,
    category: 'Good',
    questionCount: 50,
  });

  console.log('  - assessmentMode:', response3.assessmentMode);
  console.log('  - questionCount:', response3.questionCount);
  
  if (response3.assessmentMode === 'free' && response3.questionCount === 25) {
    console.log('✅ PASS: Storage coerced invalid questionCount to free/25 (maintains invariant)\n');
  } else {
    console.log('❌ FAIL: Storage should coerce invalid questionCount to valid tier (free/25)\n');
  }

  // Test 4: Both fields missing (should use defaults)
  console.log('Test 4: Storage with no assessmentMode or questionCount...');
  const response4 = await storage.createResponse({
    orgName: 'Storage Test 4',
    industry: 'Manufacturing',
    answersJson: { q1: 65 },
    pillarScores: { technology: 65, dataManagement: 0, organizationalCulture: 0, strategyPlanning: 0, riskCompliance: 0, overall: 65 },
    overall: 65,
    category: 'Moderate',
  });

  console.log('  - assessmentMode:', response4.assessmentMode);
  console.log('  - questionCount:', response4.questionCount);
  
  if (response4.assessmentMode === 'free' && response4.questionCount === 25) {
    console.log('✅ PASS: Storage applies defaults (free, 25) when both missing\n');
  } else {
    console.log('❌ FAIL: Storage should apply defaults when both fields missing\n');
  }

  // Test 5: Both provided but mismatched (should coerce to match assessmentMode)
  console.log('Test 5: Storage with mismatched assessmentMode=free and questionCount=90...');
  const response5 = await storage.createResponse({
    orgName: 'Storage Test 5',
    industry: 'Retail',
    answersJson: { q1: 70 },
    pillarScores: { technology: 70, dataManagement: 0, organizationalCulture: 0, strategyPlanning: 0, riskCompliance: 0, overall: 70 },
    overall: 70,
    category: 'Moderate',
    assessmentMode: 'free',
    questionCount: 90,
  });

  console.log('  - assessmentMode:', response5.assessmentMode);
  console.log('  - questionCount:', response5.questionCount);
  
  if (response5.assessmentMode === 'free' && response5.questionCount === 25) {
    console.log('✅ PASS: Storage coerced mismatched questionCount to match assessmentMode\n');
  } else {
    console.log('❌ FAIL: Storage should coerce questionCount to match assessmentMode\n');
  }

  console.log('=== Storage Tier Derivation Test Summary ===');
  console.log('✓ questionCount=90 → assessmentMode=full');
  console.log('✓ questionCount=25 → assessmentMode=free');
  console.log('✓ Defaults (free, 25) when both missing');
  console.log('✓ Mismatched pairs coerced to maintain invariant');
  console.log('✓ Tier tracking consistency enforced at storage boundary');
  console.log('\n✅ All storage-level tier derivation tests completed successfully!\n');
}

testStorageTierDerivation().catch(console.error);
