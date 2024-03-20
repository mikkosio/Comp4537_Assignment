const pool = require('./dbConn');

async function createTable() {
    const client = await pool.connect();
    try {
        await client.query('CREATE TABLE IF NOT EXISTS users (username VARCHAR(100) PRIMARY KEY, email VARCHAR(100), password VARCHAR(100))');
    } finally {
        client.release();
    }
}

async function sendQuery(query) {
    const client = await pool.connect();
    try {
        await createTable();
        const res = await client.query(query);
        if (res.rows.length > 0) {
            console.log(res.rows);
        }
    } finally {
        client.release();
    }
}

// insert user
async function insertUsers() {
    await sendQuery("INSERT INTO users (username, email, password) VALUES ('john', 'john@john.com', '123') ON CONFLICT DO NOTHING");
    await sendQuery("INSERT INTO users (username, email, password) VALUES ('admin', 'admin@admin.com', '111') ON CONFLICT DO NOTHING");
}
insertUsers();

// select all users
sendQuery("SELECT * FROM users");
