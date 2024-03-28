const bodyParser = require('body-parser');
const pool = require('../dbConn');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    app.get('/login', (req, res) => {
        var msg = '';
        res.render('login', {
            'msg': msg
        });
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/login', (req, res) => {

        var email = req.body.email;
        var password = req.body.password;

        pool.query('SELECT * FROM users', [], (error, results) => {
            console.log(results.rows)
        });

        if (email && password) {
            pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password], (error, results) => {
                if (results.rows.length > 0) {
                    const username = results.rows[0].username;
                    const admin = results.rows[0].admin;
                    let isAdmin = false;

                    if (admin) {
                        isAdmin = true;
                    }

                    const token = jwt.sign({ username: username, admin: isAdmin }, process.env.SECRET_KEY, { expiresIn: '1h' });
                    res.cookie('jwt', token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 60 * 60 * 1000
                    });
                    res.redirect('/dashboard');
                } else {
                    var msg = 'Incorrect username or password';
                    res.render('login', {
                        'msg': msg
                    });
                }
            });
        }
    });
}