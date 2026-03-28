const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgres://postgres:Sandoo2024%23@db.wcteznwwavtovrwhrzck.supabase.co:6543/postgres' });
  try {
    await client.connect();
    
    // Check Test data
    console.log("--- TEST DATA ---");
    const testQuery = `
      SELECT t.*, json_agg(
        json_build_object('id', q.id, 'content', q.content, 'answerOptions',
          (SELECT json_agg(json_build_object('id', a.id, 'content', a.content))
           FROM "AnswerOption" a WHERE a."questionId" = q.id))
      ) as questions
      FROM "Test" t
      LEFT JOIN "Question" q ON q."testId" = t.id
      GROUP BY t.id
    `;
    const tests = await client.query(testQuery);
    console.log('Tests found:', tests.rows.length);
    if(tests.rows.length) console.log(tests.rows[0]);
    
    // Check Programs
    console.log("--- MENTORSHIP PROGRAMS ---");
    const progQuery = `
      SELECT p.*, u."firstName" as "mentorFirstName", u."lastName" as "mentorLastName"
      FROM "MentorshipProgram" p
      JOIN "User" u ON p."mentorId" = u."id"
    `;
    const progs = await client.query(progQuery);
    console.log('Programs found:', progs.rows.length);
    if(progs.rows.length) console.log(progs.rows[0]);

  } catch(e) {
    console.error("DEBUG SCRIPT FAILED:", e.message);
  } finally {
    await client.end();
  }
}

run();
