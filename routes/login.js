const bodyParser = require('body-parser');
const pool = require('../dbConn');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

        if (email && password) {
            // sql injection protection
            let query = `SELECT * FROM users WHERE email = $1`;
            pool.query(query, [email], (error, results) => {
                if (results.rows.length > 0) {
                    const username = results.rows[0].username;
                    const hashed_password = results.rows[0].password;

                    bcrypt.compare(password, hashed_password, (err, result) => {
                        if (err) {
                            console.error(`Error comparing password: ${err}`);
                        }
                        if (result) {
                            let query = `SELECT * FROM user_roles WHERE role_id = $1`;
                            pool.query(query, [results.rows[0].role_id], (error, results) => {
                                console.log(results.rows);

                                const role = results.rows[0].role_name;
                                let isAdmin = false;

                                if (role === 'admin') {
                                    isAdmin = true;
                                }

                                const token = jwt.sign({ username: username, admin: isAdmin }, process.env.SECRET_KEY, { expiresIn: '1h' });
                                res.cookie('jwt', token, {
                                    httpOnly: true,
                                    secure: true,
                                    maxAge: 60 * 60 * 1000
                                });
                                if (isAdmin) {
                                    res.redirect('/admin');
                                } else {
                                    res.redirect('/dashboard');
                                }
                            });
                        } else {
                            var msg = 'Incorrect password';
                            res.render('login', {
                                'msg': msg
                            });
                        }
                    });
                } else {
                    var msg = 'User does not exist';
                    res.render('login', {
                        'msg': msg
                    });
                }
            });
        } else {
            var msg = 'Please enter both email and password';
            res.render('login', {
                'msg': msg
            });
        }
    });
}