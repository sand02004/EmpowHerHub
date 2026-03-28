const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:Sandoo2024%23@db.wcteznwwavtovrwhrzck.supabase.co:6543/postgres' });
async function run() {
  await client.connect();
  const tests = await client.query('SELECT id, title, \"passingScore\" FROM \"Test\"');
  const progs = await client.query('SELECT id, title FROM \"MentorshipProgram\"');
  const opps = await client.query('SELECT id, title FROM \"Opportunity\"');
  
  console.log('-- DB RECORDS --');
  console.log('Tests count:', tests.rows.length, tests.rows);
  console.log('Programs count:', progs.rows.length, progs.rows);
  console.log('Opportunities count:', opps.rows.length, opps.rows);
  
  await client.end();
}
run().catch(console.error);
