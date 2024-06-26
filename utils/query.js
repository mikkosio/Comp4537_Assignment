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
    const query = `
    ALTER TABLE user_api_consumption
    ADD CONSTRAINT user_api_consumption_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;
    `;
    

  //   const query = `CREATE TABLE user_api_consumption (
  //     user_id INT REFERENCES users(user_id),
  //     api_route_id INT REFERENCES api_route(api_route_id),
  //     request_count INT DEFAULT 0,
  //     PRIMARY KEY (user_id, api_route_id)
  // );  
	// 	`;
    
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
