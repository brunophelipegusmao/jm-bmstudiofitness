import 'dotenv/config';

// drizzle-kit 0.18.x não expõe defineConfig; exportamos o objeto direto
export default {
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
