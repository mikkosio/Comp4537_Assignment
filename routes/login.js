const bodyParser = require('body-parser');
const pool = require('../dbConn');

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
                    console.log(results.rows)
                    res.redirect('/dashboard');
                } else {
                    console.log(results.rows)
                    var msg = 'Incorrect username or password';
                    res.render('login', {
                        'msg': msg
                    });
                }
            });
        }
    });
}