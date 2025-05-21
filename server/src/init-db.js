import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function initializeDatabase() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      config.supabase.url,
      config.supabase.key
    );

    // Read schema.sql file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    if (error) {
      console.error('Error executing schema:', error);
      return;
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 