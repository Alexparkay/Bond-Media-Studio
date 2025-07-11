import { config } from 'dotenv';
config();

console.log('🚀 Database Setup Script');
console.log('========================\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in your .env file');
  console.log('\n📝 Please create a .env file with the following:');
  console.log('DATABASE_URL=postgresql://username:password@host/database');
  process.exit(1);
}

console.log('✅ DATABASE_URL is configured');
console.log('\n📦 To set up your database, run the following commands:\n');
console.log('1. Generate migrations:');
console.log('   npm run db:generate\n');
console.log('2. Push schema to database:');
console.log('   npm run db:push\n');
console.log('3. (Optional) Open Drizzle Studio to view your database:');
console.log('   npm run db:studio\n');
console.log('\n✨ Your database will be ready after running these commands!'); 