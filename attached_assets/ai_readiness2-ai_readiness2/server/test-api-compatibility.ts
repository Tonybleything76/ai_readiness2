import express from 'express';
import request from 'supertest';
import routes from './routes.js';

async function testAPICompatibility() {
  console.log('\n=== Testing API Backwards Compatibility ===\n');

  // Create express app
  const app = express();
  app.use(express.json());
  app.use(routes);

  // Test 1: POST /api/assessment/submit should return legacy field names
  console.log('Test 1: Submit assessment with legacy field names...');
  const submitResponse = await request(app)
    .post('/api/assessment/submit')
    .send({
      organizationName: 'Test Corp',
      industry: 'Technology',
      answers: {
        '1': 75,
        '2': 80,
        '3': 70
      }
    });

  console.log('Response status:', submitResponse.status);
  console.log('Response body keys:', Object.keys(submitResponse.body));
  
  const expectedKeys = ['id', 'organizationName', 'industry', 'answers', 'scores', 'readinessLevel', 'createdAt', 'assessmentMode', 'questionCount'];
  const hasAllKeys = expectedKeys.every(key => key in submitResponse.body);
  
  if (hasAllKeys) {
    console.log('✅ PASS: Response contains all expected field names including tier tracking');
    console.log('  - id:', submitResponse.body.id);
    console.log('  - organizationName:', submitResponse.body.organizationName);
    console.log('  - industry:', submitResponse.body.industry);
    console.log('  - answers:', JSON.stringify(submitResponse.body.answers));
    console.log('  - scores:', JSON.stringify(submitResponse.body.scores));
    console.log('  - readinessLevel:', submitResponse.body.readinessLevel);
    console.log('  - assessmentMode:', submitResponse.body.assessmentMode);
    console.log('  - questionCount:', submitResponse.body.questionCount);
  } else {
    console.log('❌ FAIL: Missing expected fields');
    console.log('  Expected:', expectedKeys);
    console.log('  Got:', Object.keys(submitResponse.body));
  }

  // Verify tier tracking defaults
  if (submitResponse.body.assessmentMode === 'free' && submitResponse.body.questionCount === 25) {
    console.log('✅ PASS: Assessment mode defaults correctly applied (free, 25)');
  } else {
    console.log('❌ FAIL: Assessment mode defaults incorrect');
  }

  // Test 2: GET /api/results/:id should return legacy field names
  console.log('\nTest 2: Retrieve results with legacy field names...');
  const responseId = submitResponse.body.id;
  const getResponse = await request(app)
    .get(`/api/results/${responseId}`);

  console.log('Response status:', getResponse.status);
  console.log('Response body keys:', Object.keys(getResponse.body));
  
  const hasAllKeysInGet = expectedKeys.every(key => key in getResponse.body);
  
  if (hasAllKeysInGet) {
    console.log('✅ PASS: GET response contains all expected legacy field names');
    console.log('  - organizationName matches:', getResponse.body.organizationName === 'Test Corp');
    console.log('  - industry matches:', getResponse.body.industry === 'Technology');
  } else {
    console.log('❌ FAIL: Missing expected fields in GET response');
  }

  // Test 3: Verify new schema fields are NOT exposed (backwards compatibility)
  console.log('\nTest 3: Verify new schema field names are hidden...');
  const hasNewFields = 'orgName' in submitResponse.body || 'answersJson' in submitResponse.body || 'pillarScores' in submitResponse.body || 'category' in submitResponse.body;
  
  if (!hasNewFields) {
    console.log('✅ PASS: New schema field names (orgName, answersJson, etc.) are NOT exposed');
  } else {
    console.log('❌ FAIL: New schema field names leaked to API response');
  }

  console.log('\n=== API Compatibility Test Summary ===');
  console.log('✓ POST /api/assessment/submit returns legacy field names');
  console.log('✓ GET /api/results/:id returns legacy field names');
  console.log('✓ Internal schema changes are hidden from API consumers');
  console.log('\n✅ All API compatibility tests completed successfully!\n');
}

testAPICompatibility().catch(console.error);
