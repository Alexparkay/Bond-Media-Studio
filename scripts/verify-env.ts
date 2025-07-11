import { config } from 'dotenv';
config();

console.log('🔍 Verifying Environment Variables');
console.log('===================================\n');

const requiredEnvVars = [
  'DATABASE_URL',
  'ANTHROPIC_API_KEY',
  'FREESTYLE_API_KEY',
  'STACK_PROJECT_ID',
  'STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY',
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
];

const optionalEnvVars = [
  'FREESTYLE_API_URL',
  'FREESTYLE_FIRECRACKER',
];

let hasErrors = false;

console.log('Required Environment Variables:');
console.log('------------------------------');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else {
    const maskedValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\nOptional Environment Variables:');
console.log('------------------------------');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NOT SET (using defaults)`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Check for common issues
console.log('\n🔍 Checking for Common Issues:');
console.log('----------------------------');

// Check if NEXT_PUBLIC vars match non-public versions
if (process.env.STACK_PROJECT_ID !== process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
  console.error('❌ STACK_PROJECT_ID and NEXT_PUBLIC_STACK_PROJECT_ID do not match!');
  hasErrors = true;
} else {
  console.log('✅ Stack project IDs match');
}

if (process.env.STACK_PUBLISHABLE_CLIENT_KEY !== process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
  console.error('❌ STACK_PUBLISHABLE_CLIENT_KEY and NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY do not match!');
  hasErrors = true;
} else {
  console.log('✅ Stack publishable keys match');
}

// Check database URL format
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL should start with postgresql://');
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n❌ Environment configuration has errors. Please fix them before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are properly configured!');
} 