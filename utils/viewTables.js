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
    // Check if the table name is provided as a command-line argument
    if (process.argv.length < 3) {
      console.error('Please provide the name of the table as a command-line argument.');
      return;
    }

    const tableName = process.argv[2]; // Get the table name from command-line argument
    console.log(`Connected to PostgreSQL database. Viewing table '${tableName}'`);

    // Query to select all fields from the specified table
    const query = `SELECT * FROM ${tableName}`;
    
    // Execute the query
    return client.query(query);
  })
  .then((result) => {
    // Display fetched data
    console.log(`Fetched data from table '${process.argv[2]}':`);
    console.table(result.rows);
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL or retrieving data:', err);
  })
  .finally(() => {
    // Close the client connection
    client.end();
  });
