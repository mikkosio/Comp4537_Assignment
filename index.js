const express = require('express');
const app = express();

// database connection
const pool = require('./dbConn');

// import routes
const signup = require('./routes/signup');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})

// routes
signup(app);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})