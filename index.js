//ChatGPT 3.5 and 4.0 was used for part of the code generation in this project.

const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json())

// database connection
const pool = require('./dbConn');

// import routes
const signup = require('./routes/signup');
const login = require('./routes/login');
const dashboard = require('./routes/dashboard');
const logout = require('./routes/logout');
const admin = require('./routes/admin');
const chatroom = require('./routes/chatroom');
const profile = require('./routes/profile');

app.set('view engine', 'ejs');

// let numRequestsMade = 0;

// // Define a middleware function to execute before handling each request
// function myMiddleware(req, res, next) {
//     // Execute your function here (e.g., query that increments a number)
//     // For example, you can log information about the request
//     // console.log('Request URL:', req.originalUrl);
//     // console.log('Request Method:', req.method);

//     console.log(++numRequestsMade);
    
//     // Call next() to pass control to the next middleware function
//     next();
// }

// // Register the middleware function to execute for every request
// app.use(myMiddleware);


app.get('/', (req, res) => {
    if (req.cookies.jwt) {
        return res.redirect('/dashboard');
    }
    res.render('index');
})

// routes
signup(app);
login(app);
dashboard(app);
logout(app);
admin(app);
chatroom(app);
profile(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})