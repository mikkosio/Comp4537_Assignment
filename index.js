const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// database connection
const pool = require('./dbConn');

// import routes
const signup = require('./routes/signup');
const login = require('./routes/login');
const dashboard = require('./routes/dashboard');
const logout = require('./routes/logout');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})

// routes
signup(app);
login(app);
dashboard(app);
logout(app);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})