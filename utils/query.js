const { Client } = require('pg');
require('dotenv').config({ path: `../.env` });

// Configuration for the PostgreSQL connection
const client = new Client({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  connectionString: process.env.POSTGRES_URL
});

// Connect to PostgreSQL database
client.connect()
  .then(() => {
    const query = `SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
		`;
    
    // Execute the query
    return client.query(query);
  })
  .then((result) => {
    // Display fetched data
    console.table(result.rows);
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL or retrieving data:', err);
  })
  .finally(() => {
    // Close the client connection
    client.end();
  });
