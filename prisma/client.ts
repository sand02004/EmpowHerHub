import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL?.includes('${')
  ? `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`
  : (process.env.DATABASE_URL ?? 'postgresql://postgres:admin123@localhost:5432/EmpowHerHub?schema=public');

const pool = new Pool({ connectionString });

// A lightweight Prisma-compatible client that wraps a raw pg Pool
// Used as a fallback when Prisma Client cannot be generated
class PgClient {
  public pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async $connect() {
    console.log('[PgClient] Connected to PostgreSQL via pg Pool');
  }

  async $disconnect() {
    await this.pool.end();
  }

  async $queryRaw(strings: any, ...values: any[]): Promise<any[]> {
    let text: string;
    let params: any[];

    if (strings && typeof strings === 'object' && strings.text) {
      // Prisma's internal Sql object format
      text = strings.text;
      params = strings.values || [];
    } else if (Array.isArray(strings)) {
      // Tagged template literal - build parameterized query
      text = (strings as any[]).reduce((acc: string, str: string, i: number) =>
        acc + str + (values[i] !== undefined ? `$${i + 1}` : ''), '');
      params = values;
    } else {
      text = String(strings);
      params = values;
    }

    const result = await this.pool.query(text, params);
    return result.rows;
  }

  async $executeRaw(strings: any, ...values: any[]): Promise<number> {
    let text: string;
    let params: any[];

    if (strings && typeof strings === 'object' && strings.text) {
      text = strings.text;
      params = strings.values || [];
    } else if (Array.isArray(strings)) {
      text = (strings as any[]).reduce((acc: string, str: string, i: number) =>
        acc + str + (values[i] !== undefined ? `$${i + 1}` : ''), '');
      params = values;
    } else {
      text = String(strings);
      params = values;
    }

    const result = await this.pool.query(text, params);
    return result.rowCount ?? 0;
  }

  // Stubs for any old Prisma model access that might still exist
  get user() { return this._makeProxy('User'); }
  get womenProfile() { return this._makeProxy('WomenProfile'); }
  get mentorProfile() { return this._makeProxy('MentorProfile'); }
  get sponsorProfile() { return this._makeProxy('SponsorProfile'); }
  get adminProfile() { return this._makeProxy('AdminProfile'); }
  get fileUpload() { return this._makeProxy('FileUpload'); }
  get opportunity() { return this._makeProxy('Opportunity'); }
  get opportunityApplication() { return this._makeProxy('OpportunityApplication'); }
  get mentorshipProgram() { return this._makeProxy('MentorshipProgram'); }
  get mentorshipApplication() { return this._makeProxy('MentorshipApplication'); }
  get mentorship() { return this._makeProxy('Mentorship'); }
  get test() { return this._makeProxy('Test'); }
  get question() { return this._makeProxy('Question'); }
  get answerOption() { return this._makeProxy('AnswerOption'); }
  get userTest() { return this._makeProxy('UserTest'); }
  get conversation() { return this._makeProxy('Conversation'); }
  get message() { return this._makeProxy('Message'); }

  public _makeProxy(model: string) {
    const self = this;
    return new Proxy({}, {
      get(_, method) {
        return async (...args: any[]) => {
          console.warn(`[PgClient] Direct Prisma model method called: ${model}.${String(method)} - use $queryRaw instead`);
          return null;
        };
      }
    });
  }
}

// Singleton
const globalForPrisma = global as unknown as { prisma: PgClient };
export const prisma = globalForPrisma.prisma || new PgClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
