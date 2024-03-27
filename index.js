const express = require('express');
const app = express();

const pool = require('./dbConn');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})