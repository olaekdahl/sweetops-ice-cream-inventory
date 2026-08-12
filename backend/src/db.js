import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || 'ice_cream_inventory',
  user: process.env.POSTGRES_USER || 'sweetops',
  password: process.env.POSTGRES_PASSWORD || 'sweetops_dev_password',
  max: 10,
  idleTimeoutMillis: 30000
});

export async function query(text, params) {
  return pool.query(text, params);
}

