const jwt = require('jsonwebtoken');
const pool = require('../dbConn');
const bcrypt = require("bcrypt");
const lang = require("../lang/en");
const saltRounds = 10;

module.exports = (app) => {
    app.get('/signup', (req, res) => {
        var msg = '';
        if (req.query.msg != undefined) {
            var msg = req.query.msg;
        }

        res.render('signup', {
            'msg': msg
        });
    });

    app.post('/signup', async (req, res) => {
        // get user input
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // check if user already exists
        const client = await pool.connect();
        try {
            // sql injection protection
            let query = 'SELECT * FROM users WHERE username = $1';
            const result = await client.query(query, [username]);
            if (result.rows.length > 0) {
                return res.redirect(`/signup?msg=${lang.duplicated_username}`);
            } else {
                // hash password
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                    if (err) {
                        console.error(`Error hashing password: ${err}`);
                    }
                    try {
                        let query = 'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)';
                        await client.query(query, [username, email, hash, 1]);
                    } catch (err) {
                        console.error(`Error inserting user: ${err}`);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            client.release();
        }

        // create token
        const token = jwt.sign({ username: username }, process.env.SECRET_KEY);

        // send token in cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        // redirect to dashboard
        res.redirect('/dashboard');
    });
}
