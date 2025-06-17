import { Client } from 'pg';

type QueryResult = {
  lastID?: number;
  rows: any[];
};

class PgWrapper {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async run(sql: string, ...params: any[]): Promise<QueryResult> {
    const result = await this.client.query(sql + ' RETURNING id', params);
    return {
      lastID: result.rows[0]?.id,
      rows: result.rows,
    };
  }

  async get(sql: string, ...params: any[]) {
    const result = await this.client.query(sql, params);
    return result.rows[0];
  }

  async all(sql: string, ...params: any[]) {
    const result = await this.client.query(sql, params);
    return result.rows;
  }
}

let dbInstance: PgWrapper | null = null;

export const getDb = async (): Promise<PgWrapper> => {
  if (dbInstance) return dbInstance;

  const client = new Client({
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.uqyuhmovgfpklefywmpv',
    password: 'SAGARKASHYAP8',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  dbInstance = new PgWrapper(client);
  return dbInstance;
};
