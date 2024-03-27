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

        var username = req.body.username;
        var password = req.body.password;

        if (username && password) {
            pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error, results) => {
                if (results.rows.length > 0) {
                    const token = jwt.sign({ username: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
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