import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Carregar variáveis de ambiente
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida no arquivo .env');
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });
