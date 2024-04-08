const bodyParser = require('body-parser');
const pool = require('../dbConn');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const lang = require("../lang/en")
const saltRounds = 10;


module.exports = (app) => {
	app.get('/deleteUser', (req, res) => {
		const token = req.cookies.jwt;

		if (!token) {
			console.error("No token found for this user");
			return res.redirect("/login");
		}
		try {
			res.render('deleteUser', {
				msg: null,
				lang: lang
			}); // Pass null for msg
		} catch (err) {
			console.error(err);
			return res.redirect("/login");
		}
	})

	app.post('/deleteUser', (req, res) => {
			var username = req.body.username;
			var password = req.body.password;

			if (username && password) {
					// Authenticate user
					let query = `SELECT * FROM users WHERE username = $1`;
					pool.query(query, [username], (error, results) => {
							if (results.rows.length > 0) {
									const hashed_password = results.rows[0].password;

									bcrypt.compare(password, hashed_password, (err, result) => {
											if (err) {
													console.error(`Error comparing password: ${err}`);
													res.status(500).send('Internal Server Error');
													return;
											}
											if (result) {
													// Delete user
													let deleteQuery = `DELETE FROM users WHERE username = $1`;
													pool.query(deleteQuery, [username], (error, results) => {
															if (error) {
																	console.error(`Error deleting user: ${error}`);
																	res.status(500).send('Internal Server Error');
																	return;
															}
															res.redirect('/login');
													});
											} else {
													var msg = 'Incorrect username or password';
													res.render('deleteUser', {
															'msg': msg
													});
											}
									});
							} else {
									var msg = 'User does not exist';
									res.render('deleteUser', {
											'msg': msg,
											lang: lang
									});
							}
					});
			} else {
					var msg = 'Please enter both username and password';
					res.render('deleteUser', {
							'msg': msg,
							lang: lang
					});
			}
	});
};
