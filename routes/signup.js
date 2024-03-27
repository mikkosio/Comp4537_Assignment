const jwt = require('jsonwebtoken');
const pool = require('../dbConn');

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
            const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                return res.redirect('/signup?msg=User already exists');
            } else {
                await client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);
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
