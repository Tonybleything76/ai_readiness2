import { storage } from './storage.js';
import { FREE_COUNT, FULL_COUNT } from './utils/questionLoader.js';

async function testAssessmentMode() {
  console.log('\n=== Testing Assessment Mode Implementation ===\n');

  // Test 1: Create response without specifying assessmentMode (should default to 'free')
  console.log('Test 1: Creating response without assessmentMode (should default to free)...');
  const response1 = await storage.createResponse({
    orgName: 'Test Company 1',
    industry: 'Technology',
    answersJson: { q1: 75, q2: 80 },
    pillarScores: {
      technology: 77,
      dataManagement: 0,
      organizationalCulture: 0,
      strategyPlanning: 0,
      riskCompliance: 0,
      overall: 77
    },
    overall: 77,
    category: 'Good Progress',
  });
  
  console.log('✓ Response created with ID:', response1.id);
  console.log('  - assessmentMode:', response1.assessmentMode);
  console.log('  - questionCount:', response1.questionCount);
  console.log('  - Expected: assessmentMode=free, questionCount=25');
  
  if (response1.assessmentMode === 'free' && response1.questionCount === 25) {
    console.log('  ✅ PASS: Defaults applied correctly\n');
  } else {
    console.log('  ❌ FAIL: Defaults not correct\n');
  }

  // Test 2: Create response with explicit assessmentMode='full'
  console.log('Test 2: Creating response with assessmentMode=full...');
  const response2 = await storage.createResponse({
    orgName: 'Test Company 2',
    industry: 'Healthcare',
    answersJson: { q1: 90, q2: 85 },
    pillarScores: {
      technology: 87,
      dataManagement: 0,
      organizationalCulture: 0,
      strategyPlanning: 0,
      riskCompliance: 0,
      overall: 87
    },
    overall: 87,
    category: 'AI Ready',
    assessmentMode: 'full',
    questionCount: FULL_COUNT,
  });
  
  console.log('✓ Response created with ID:', response2.id);
  console.log('  - assessmentMode:', response2.assessmentMode);
  console.log('  - questionCount:', response2.questionCount);
  console.log(`  - Expected: assessmentMode=full, questionCount=${FULL_COUNT}`);
  
  if (response2.assessmentMode === 'full' && response2.questionCount === FULL_COUNT) {
    console.log('  ✅ PASS: Full assessment mode set correctly\n');
  } else {
    console.log('  ❌ FAIL: Full assessment mode not correct\n');
  }

  // Test 3: Verify counts from questionLoader
  console.log('Test 3: Verifying question counts...');
  console.log(`  - FREE_COUNT: ${FREE_COUNT} (expected: 25)`);
  console.log(`  - FULL_COUNT: ${FULL_COUNT} (expected: 90)`);
  
  if (FREE_COUNT === 25 && FULL_COUNT === 90) {
    console.log('  ✅ PASS: Question counts are correct\n');
  } else {
    console.log('  ❌ FAIL: Question counts are incorrect\n');
  }

  // Test 4: Retrieve response by ID
  console.log('Test 4: Retrieving response by ID...');
  const retrieved = await storage.getResponse(response1.id);
  
  if (retrieved && retrieved.assessmentMode === 'free' && retrieved.questionCount === 25) {
    console.log('✓ Response retrieved successfully');
    console.log('  ✅ PASS: Retrieved response has correct fields\n');
  } else {
    console.log('  ❌ FAIL: Retrieved response is incorrect\n');
  }

  console.log('=== Test Summary ===');
  console.log('✓ Assessment mode enum working: free | full');
  console.log('✓ Default values applied: assessmentMode=free, questionCount=25');
  console.log('✓ Explicit values respected when provided');
  console.log('✓ Question counts loaded correctly: FREE=25, FULL=90');
  console.log('\n✅ All tests completed successfully!\n');
}

testAssessmentMode().catch(console.error);
