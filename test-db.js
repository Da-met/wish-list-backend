const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:passfromwish123A@db.ojqwctfoabytqzyljnqp.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log('✅ Connected to Supabase database!'))
  .catch(err => console.error('❌ Connection error:', err))
  .finally(() => client.end());