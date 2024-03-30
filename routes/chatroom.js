const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const pool = require('../dbConn');

module.exports = (app) => {
    app.get("/chatroom", (req, res) => {
        // Retrieve JWT token from cookie
        const token = req.cookies.jwt;

        // If token is not present, redirect to login
        if (!token) {
            console.error("No token found for this user");
            return res.redirect("/login");
        }
        try {
            // Verify and decode JWT token
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
            // Access the username from the decoded token
            const username = decodedToken.username;
            res.render("chatroom", {
                username: username,
            });
        } catch (err) {
            console.error(err);
            return res.redirect("/login");
        }
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/text-input', (req, res) => {
        const token = req.cookies.jwt;
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const username = decodedToken.username;
        let query = 'SELECT * FROM users WHERE username = $1';
        pool.query(query, [username], (error, results) => {
            if (results.rows.length > 0) {
                console.log(results.rows);
            }
        });
    });
};